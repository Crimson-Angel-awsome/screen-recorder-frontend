// ============================================================================
// AUTHENTICATION MODULE
// ============================================================================

class AuthService {
    constructor() {
        this.API_BASE_URL = 'http://127.0.0.1:8000';
        this.TOKEN_KEY = 'auth_token';
        this.USER_KEY = 'user_data';
    }

    // ========================================
    // SIGN UP ENDPOINT PLACEHOLDER
    // ========================================
    async signup(userData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // Successful signup - redirect to login
                showToast('Account created successfully! Please login.', 'success');
                // Redirect to login page
                window.location.href = 'index.html';
                return data;
            } else {
                throw new Error(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showToast(error.message || 'Signup failed', 'error');
            throw error;
        }
    }

    // ========================================
    // LOGIN ENDPOINT PLACEHOLDER
    // ========================================
    async login(credentials) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                // Store JWT token in localStorage
                this.setToken(data.token);
                
                // Store user data
                this.setUserData(data.user);

                showToast('Login successful!', 'success');
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
                
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast(error.message || 'Login failed', 'error');
            throw error;
        }
    }

    // Store JWT token in localStorage
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    // Get JWT token from localStorage
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Store user data in localStorage
    setUserData(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    // Get user data from localStorage
    getUserData() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired (decode JWT)
        try {
            const payload = this.decodeJWT(token);
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    // Decode JWT token (simple implementation)
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = 'login.html';
    }

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

// ============================================================================
// SCREEN RECORDING MODULE
// ============================================================================

class ScreenRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.startTime = null;
        this.timerInterval = null;
        this.currentRecording = null;
        this.API_BASE_URL = 'http://127.0.0.1:8000'; // Replace with your actual API URL
    }

    // ========================================
    // ENDPOINT 1: RECORD SCREEN
    // ========================================
    async startRecording() {
        try {
            // Request screen capture
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: true
            });

            // Show preview
            const previewVideo = document.getElementById('previewVideo');
            previewVideo.srcObject = this.stream;

            // Set up MediaRecorder
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000
            };

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every second
            this.startTime = Date.now();
            this.startTimer();

            // Update UI
            document.getElementById('startRecordingBtn').disabled = true;
            document.getElementById('stopRecordingBtn').disabled = false;
            document.getElementById('recordingStatus').textContent = 'Recording...';

            showToast('Recording started', 'success');

            // Handle stream end (user stops sharing)
            this.stream.getVideoTracks()[0].addEventListener('ended', () => {
                this.stopRecording();
            });

        } catch (error) {
            console.error('Error starting recording:', error);
            showToast('Failed to start recording: ' + error.message, 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.stream.getTracks().forEach(track => track.stop());
            this.stopTimer();
            
            // Update UI
            document.getElementById('startRecordingBtn').disabled = false;
            document.getElementById('stopRecordingBtn').disabled = true;
            document.getElementById('recordingStatus').textContent = 'Recording stopped';
        }
    }

    handleRecordingStop() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const duration = this.calculateDuration();
        
        this.currentRecording = {
            blob: blob,
            url: URL.createObjectURL(blob),
            timestamp: new Date().toISOString(),
            duration: duration,
            name: `recording_${Date.now()}.webm`,
            size: blob.size
        };

        // Clear preview
        const previewVideo = document.getElementById('previewVideo');
        previewVideo.srcObject = null;

        // Enable action buttons
        this.enableActionButtons();

        // Display video info
        this.displayVideoInfo();

        showToast('Recording completed', 'success');
    }

    startTimer() {
        const timerElement = document.getElementById('recordingTimer');
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            timerElement.textContent = this.formatTime(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    calculateDuration() {
        if (this.startTime) {
            return Math.floor((Date.now() - this.startTime) / 1000);
        }
        return 0;
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    enableActionButtons() {
        document.getElementById('saveVideoBtn').disabled = false;
        document.getElementById('renameVideoBtn').disabled = false;
        document.getElementById('copyLinkBtn').disabled = false;
    }

    disableActionButtons() {
        document.getElementById('saveVideoBtn').disabled = true;
        document.getElementById('renameVideoBtn').disabled = true;
        document.getElementById('copyLinkBtn').disabled = true;
    }

    displayVideoInfo() {
        const info = document.getElementById('videoInfo');
        const sizeMB = (this.currentRecording.size / (1024 * 1024)).toFixed(2);
        info.innerHTML = `
            <strong>Current Recording:</strong><br>
            Name: ${this.currentRecording.name}<br>
            Duration: ${this.formatTime(this.currentRecording.duration * 1000)}<br>
            Size: ${sizeMB} MB<br>
            Created: ${new Date(this.currentRecording.timestamp).toLocaleString()}
        `;
    }

    // ========================================
    // ENDPOINT 2: SAVE VIDEO
    // ========================================
    async saveVideo() {
        if (!this.currentRecording) {
            showToast('No recording to save', 'error');
            return;
        }

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('video', this.currentRecording.blob, this.currentRecording.name);
            formData.append('duration', this.currentRecording.duration);
            formData.append('timestamp', this.currentRecording.timestamp);

            // Get auth token
            const token = authService.getToken();

            // Send to server
            const response = await fetch(`${this.API_BASE_URL}/recordings/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Video saved successfully', 'success');
                
                // Update current recording with server response
                this.currentRecording.id = data.videoId;
                this.currentRecording.shareLink = data.shareLink;

                // Refresh library
                videoLibrary.loadLibrary();

                // Also allow local download
                this.downloadVideo();
            } else {
                throw new Error(data.message || 'Failed to save video');
            }
        } catch (error) {
            console.error('Error saving video:', error);
            showToast('Failed to save video: ' + error.message, 'error');
            
            // Fallback to local download if server save fails
            this.downloadVideo();
        }
    }

    // Local download fallback
    downloadVideo() {
        const a = document.createElement('a');
        a.href = this.currentRecording.url;
        a.download = this.currentRecording.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Video downloaded locally', 'success');
    }

    // ========================================
    // ENDPOINT 3: RENAME RECORDING
    // ========================================
    async renameRecording(newName, videoId = null) {
        try {
            const targetId = videoId || this.currentRecording?.id;
            
            if (!targetId) {
                // Just update local name if not saved yet
                if (this.currentRecording) {
                    const extension = this.currentRecording.name.split('.').pop();
                    this.currentRecording.name = `${newName}.${extension}`;
                    this.displayVideoInfo();
                    showToast('Recording renamed', 'success');
                }
                return;
            }

            // Send rename request to server
            const token = authService.getToken();
            const response = await fetch(`${this.API_BASE_URL}/recordings/${targetId}/rename`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Recording renamed successfully', 'success');
                
                // Update current recording if it's the one being renamed
                if (this.currentRecording && this.currentRecording.id === targetId) {
                    this.currentRecording.name = newName;
                    this.displayVideoInfo();
                }

                // Refresh library
                videoLibrary.loadLibrary();
            } else {
                throw new Error(data.message || 'Failed to rename recording');
            }
        } catch (error) {
            console.error('Error renaming recording:', error);
            showToast('Failed to rename: ' + error.message, 'error');
        }
    }

    // ========================================
    // ENDPOINT 4: COPY/SHARE VIDEO LINK
    // ========================================
    async copyShareLink(videoId = null) {
        try {
            const targetId = videoId || this.currentRecording?.id;
            
            if (!targetId) {
                showToast('Video must be saved before sharing', 'error');
                return;
            }

            // Get share link from server
            const token = authService.getToken();
            const response = await fetch(`${this.API_BASE_URL}/recordings/${targetId}/upload-link`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                const shareLink = data.shareLink;
                
                // Copy to clipboard
                await navigator.clipboard.writeText(shareLink);
                showToast('Share link copied to clipboard', 'success');

                // Update current recording
                if (this.currentRecording && this.currentRecording.id === targetId) {
                    this.currentRecording.shareLink = shareLink;
                }
            } else {
                throw new Error(data.message || 'Failed to get share link');
            }
        } catch (error) {
            console.error('Error getting share link:', error);
            showToast('Failed to copy link: ' + error.message, 'error');
        }
    }
}

// ============================================================================
// VIDEO LIBRARY MODULE
// ============================================================================

class VideoLibrary {
    constructor() {
        this.API_BASE_URL = 'http://127.0.0.1:8000'; // Replace with your actual API URL
        this.videos = [];
        this.filteredVideos = [];
    }

    // ========================================
    // ENDPOINT 5: VIEW LIBRARY OF ALL RECORDINGS
    // ========================================
    async loadLibrary() {
        try {
            const token = authService.getToken();
            const response = await fetch(`${this.API_BASE_URL}/recordings?user_id=${authService.getUserId()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.videos = data.videos;
                this.filteredVideos = [...this.videos];
                this.renderLibrary();
            } else {
                throw new Error(data.message || 'Failed to load library');
            }
        } catch (error) {
            console.error('Error loading library:', error);
            showToast('Failed to load library: ' + error.message, 'error');
            this.renderEmptyState();
        }
    }

    renderLibrary() {
        const container = document.getElementById('libraryContainer');
        const emptyState = document.getElementById('emptyLibrary');

        if (this.filteredVideos.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = this.filteredVideos.map(video => this.createLibraryItem(video)).join('');

        // Add event listeners to library items
        this.attachLibraryEventListeners();
    }

    createLibraryItem(video) {
        const date = new Date(video.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        const duration = this.formatDuration(video.duration);

        return `
            <div class="library-item" data-video-id="${video.id}">
                <div class="library-item-title">${video.name}</div>
                <div class="library-item-date">${formattedDate} at ${formattedTime}</div>
                <div class="library-item-duration">Duration: ${duration}</div>
                <div class="library-item-actions">
                    <button class="btn-primary view-video-btn" data-video-id="${video.id}">View</button>
                    <button class="btn-secondary rename-library-btn" data-video-id="${video.id}">Rename</button>
                    <button class="btn-secondary copy-link-library-btn" data-video-id="${video.id}">Share</button>
                    <button class="btn-danger delete-video-btn" data-video-id="${video.id}">Delete</button>
                </div>
            </div>
        `;
    }

    attachLibraryEventListeners() {
        // View video
        document.querySelectorAll('.view-video-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoId = e.target.dataset.videoId;
                this.viewVideo(videoId);
            });
        });

        // Rename from library
        document.querySelectorAll('.rename-library-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoId = e.target.dataset.videoId;
                this.showRenameModal(videoId);
            });
        });
    }
}