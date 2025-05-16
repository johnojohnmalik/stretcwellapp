// Dashboard Functionality for Stretch-Well App
import { 
    getSavedQuestionnaireData, 
    getPersonalizedRecommendations, 
    getExercisesForBodyAreas,
    loadExercises,
    loadStretches 
} from './js/data-service.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard with dynamic data
    initDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

async function initDashboard() {
    // Update greeting with time of day
    updateGreeting();
    
    // Set current date
    updateDate();
    
    // Check if data exists - if not, redirect to questionnaire
    checkUserData();
    
    // Load personalized data for the dashboard
    await loadPersonalizedContent();
    
    // Load exercise data for the dashboard
    await loadExerciseData();
    
    // Simulate loading data (for demo purposes only)
    simulateDataLoading();
}

function checkUserData() {
    const userData = getSavedQuestionnaireData();
    // If no user data, redirect to questionnaire
    if (!userData) {
        console.warn('No user data found. Redirecting to questionnaire.');
        window.location.href = 'questionnaire.html';
    }
}

function updateGreeting() {
    const greeting = document.querySelector('.greeting');
    if (!greeting) return;
    
    const hour = new Date().getHours();
    let greetingText = 'Welcome';
    
    if (hour >= 5 && hour < 12) {
        greetingText = 'Good Morning';
    } else if (hour >= 12 && hour < 18) {
        greetingText = 'Good Afternoon';
    } else if (hour >= 18 && hour < 22) {
        greetingText = 'Good Evening';
    } else {
        greetingText = 'Good Night';
    }
    
    // Get user name from localStorage or use default
    const userData = getSavedQuestionnaireData();
    const username = userData?.username || 'Wellness Seeker';
    
    greeting.textContent = `${greetingText}, ${username}`;
}

function updateDate() {
    const dateElement = document.querySelector('.section-subheader');
    if (!dateElement) return;
    
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const currentDate = new Date().toLocaleDateString('en-US', options);
    dateElement.textContent = currentDate;
}

async function loadPersonalizedContent() {
    try {
        // Get questionnaire data
        const userData = getSavedQuestionnaireData();
        
        if (!userData) {
            console.warn('No saved questionnaire data found. Using default recommendations.');
            return;
        }
        
        // Get stretches based on user data
        const recommendations = await getPersonalizedRecommendations(userData);
        
        if (recommendations && recommendations.length > 0) {
            updateDailyStretches(recommendations);
            
            // Update dashboard title with personalized information
            updateDashboardTitle(userData, recommendations);
        } else {
            // Display message if no recommendations found
            showNoRecommendationsMessage();
        }
        
        // Update focus areas based on discomfort areas
        if (userData.discomfortAreas && userData.discomfortAreas.length > 0) {
            updateFocusAreas(userData.discomfortAreas);
        }
        
    } catch (error) {
        console.error('Error loading personalized content:', error);
        // Show error message to user
        showErrorMessage('We encountered an issue loading your personalized recommendations. Please try again later.');
    }
}

function updateDashboardTitle(userData, recommendations) {
    const titleElem = document.querySelector('.dashboard-title');
    if (!titleElem) return;
    
    // Update the title with personalized information
    const totalExercises = countExercisesInRecommendations(recommendations);
    const discomfortAreas = userData.discomfortAreas || [];
    
    // Generate a focus area text from the first discomfort area, if any
    let focusText = discomfortAreas.length > 0 ? `focusing on ${formatAreaName(discomfortAreas[0])}` : 'for overall wellness';
    
    // Add routine duration if available
    let durationText = '';
    if (userData.routineDuration && userData.routineDuration.label) {
        durationText = ` (${userData.routineDuration.label})`;
    }
    
    // Set the title text
    titleElem.textContent = `Your personalized ${totalExercises} exercise routine${durationText} ${focusText}`;
    
    // Add a view routine button if we have recommendations
    if (recommendations && recommendations.length > 0) {
        // Check if button already exists
        if (!document.querySelector('.view-routine-btn')) {
            const actionContainer = document.querySelector('.action-buttons');
            if (!actionContainer) {
                // Create action container if it doesn't exist
                const container = document.createElement('div');
                container.className = 'action-buttons';
                container.style.marginTop = '15px';
                container.style.display = 'flex';
                container.style.justifyContent = 'center';
                
                const viewRoutineBtn = document.createElement('a');
                viewRoutineBtn.href = 'routine.html';
                viewRoutineBtn.className = 'view-routine-btn btn-primary';
                viewRoutineBtn.textContent = 'View Complete Routine';
                viewRoutineBtn.style.backgroundColor = '#0A99AB';
                viewRoutineBtn.style.color = 'white';
                viewRoutineBtn.style.padding = '10px 20px';
                viewRoutineBtn.style.borderRadius = '30px';
                viewRoutineBtn.style.textDecoration = 'none';
                viewRoutineBtn.style.fontWeight = '600';
                viewRoutineBtn.style.boxShadow = '0 4px 10px rgba(10, 153, 171, 0.25)';
                viewRoutineBtn.style.transition = 'all 0.3s ease';
                
                // Add hover effect using event listeners
                viewRoutineBtn.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#088596';
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 15px rgba(10, 153, 171, 0.3)';
                });
                
                viewRoutineBtn.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '#0A99AB';
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 10px rgba(10, 153, 171, 0.25)';
                });
                
                container.appendChild(viewRoutineBtn);
                
                // Insert after the dashboard title
                const dashboardHeader = document.querySelector('.dashboard-header');
                if (dashboardHeader) {
                    dashboardHeader.insertAdjacentElement('afterend', container);
                }
            }
        }
    }
}

// Helper function to count total exercises in recommendations
function countExercisesInRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) return 0;
    
    let totalExercises = 0;
    recommendations.forEach(rec => {
        if (rec.exercises) {
            totalExercises += rec.exercises.split('|').length;
        }
    });
    
    return totalExercises;
}

function showNoRecommendationsMessage() {
    const stretchesContainer = document.querySelector('.stretches-container');
    if (!stretchesContainer) return;
    
    stretchesContainer.innerHTML = `
        <div class="no-data-message">
            <h3>No personalized recommendations yet</h3>
            <p>We couldn't find stretches that match your profile. Please update your questionnaire or try again later.</p>
            <a href="questionnaire.html" class="btn-stretch">Update Preferences</a>
        </div>
    `;
}

function showErrorMessage(message) {
    // Create an error banner at the top of the page
    const errorBanner = document.createElement('div');
    errorBanner.className = 'error-banner';
    errorBanner.innerHTML = `
        <p>${message}</p>
        <button class="close-error">×</button>
    `;
    
    // Style the error banner
    errorBanner.style.backgroundColor = '#ffeeee';
    errorBanner.style.color = '#d9534f';
    errorBanner.style.padding = '10px 20px';
    errorBanner.style.margin = '0 0 20px 0';
    errorBanner.style.borderRadius = '4px';
    errorBanner.style.display = 'flex';
    errorBanner.style.justifyContent = 'space-between';
    errorBanner.style.alignItems = 'center';
    
    // Add to the beginning of the dashboard
    const dashboard = document.querySelector('.dashboard-content');
    if (dashboard) {
        dashboard.insertBefore(errorBanner, dashboard.firstChild);
    }
    
    // Add click handler to close button
    errorBanner.querySelector('.close-error').addEventListener('click', function() {
        errorBanner.remove();
    });
}

async function loadExerciseData() {
    try {
        // Get all exercises from CSV
        const exercises = await loadExercises();
        
        // Get user data
        const userData = getSavedQuestionnaireData();
        if (!userData || !userData.discomfortAreas || userData.discomfortAreas.length === 0) {
            return;
        }
        
        // Get exercises for user's discomfort areas
        const targetedExercises = await getExercisesForBodyAreas(userData.discomfortAreas);
        
        // Update exercise cards if we have data
        if (targetedExercises && targetedExercises.length > 0) {
            updateTargetedExercises(targetedExercises);
        }
    } catch (error) {
        console.error('Error loading exercise data:', error);
    }
}

function updateTargetedExercises(exercises) {
    const exercisesContainer = document.querySelector('.exercises-container');
    if (!exercisesContainer) return;
    
    // Limit to max 3 exercises
    const displayExercises = exercises.slice(0, 3);
    
    // Clear container
    exercisesContainer.innerHTML = '';
    
    // Add heading
    const heading = document.createElement('h3');
    heading.className = 'section-title';
    heading.textContent = 'Targeted Exercises';
    exercisesContainer.appendChild(heading);
    
    // Add exercises
    displayExercises.forEach(exercise => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-card';
        
        exerciseCard.innerHTML = `
            <h4>${exercise.name}</h4>
            <p class="exercise-info">${exercise.difficulty} • ${exercise.duration} sec</p>
            <p>${exercise.description}</p>
            <div class="exercise-areas">
                ${formatAreaTags(exercise.bodyAreas)}
            </div>
            <button class="btn-view-exercise" data-exercise-id="${exercise.exerciseId}">View Details</button>
        `;
        
        exercisesContainer.appendChild(exerciseCard);
    });
}

function formatAreaTags(areasString) {
    if (!areasString) return '';
    
    const areas = areasString.split('|');
    let tagsHtml = '';
    
    areas.forEach(area => {
        tagsHtml += `<span class="area-tag">${formatAreaName(area)}</span>`;
    });
    
    return tagsHtml;
}

function updateDailyStretches(recommendations) {
    const stretchesContainer = document.querySelector('.stretches-container');
    if (!stretchesContainer) return;
    
    // Categorize stretches by time of day
    const timeCategories = {
        morning: [],
        midday: [],
        evening: []
    };
    
    // Sort recommendations into time categories
    recommendations.forEach(stretch => {
        const timeOfDay = stretch.timeOfDay.toLowerCase();
        if (timeOfDay === 'morning' || timeOfDay === 'midday' || timeOfDay === 'evening') {
            timeCategories[timeOfDay].push(stretch);
        } else if (timeOfDay === 'anytime') {
            // For 'anytime' stretches, place in category with least items
            const leastCategory = Object.entries(timeCategories)
                .sort(([,a], [,b]) => a.length - b.length)[0][0];
            timeCategories[leastCategory].push(stretch);
        }
    });
    
    // Select top stretches from each category
    const selectedStretches = [];
    Object.entries(timeCategories).forEach(([timeOfDay, stretches]) => {
        if (stretches.length > 0) {
            // Sort by priority if available
            const sorted = stretches.sort((a, b) => {
                const priorityMap = { high: 3, medium: 2, low: 1 };
                return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
            });
            
            // Take the top rated stretch for this time of day
            selectedStretches.push({
                ...sorted[0],
                displayTimeOfDay: timeOfDay // Add display time
            });
        }
    });
    
    // Get user preferences to show routine duration
    const userData = getSavedQuestionnaireData();
    const routineDuration = userData?.routineDuration?.label || null;
    
    // Clear the container
    stretchesContainer.innerHTML = '';
    
    // Add a header with routine duration if available
    if (routineDuration) {
        const durationHeader = document.createElement('div');
        durationHeader.className = 'routine-duration-header';
        durationHeader.innerHTML = `
            <div class="duration-icon">⏱️</div>
            <div class="duration-text">
                <p>${routineDuration} routine</p>
            </div>
        `;
        durationHeader.style.display = 'flex';
        durationHeader.style.alignItems = 'center';
        durationHeader.style.marginBottom = '15px';
        durationHeader.style.padding = '8px 12px';
        durationHeader.style.backgroundColor = 'rgba(10, 153, 171, 0.1)';
        durationHeader.style.borderRadius = '6px';
        durationHeader.querySelector('.duration-icon').style.marginRight = '10px';
        durationHeader.querySelector('.duration-icon').style.fontSize = '1.2rem';
        durationHeader.querySelector('.duration-text p').style.margin = '0';
        durationHeader.querySelector('.duration-text p').style.fontWeight = '500';
        
        stretchesContainer.appendChild(durationHeader);
    }
    
    // Add stretches to the container
    selectedStretches.forEach(stretch => {
        const stretchCard = document.createElement('div');
        stretchCard.className = 'stretch-card';
        
        const displayTimeOfDay = stretch.displayTimeOfDay.charAt(0).toUpperCase() + 
                                 stretch.displayTimeOfDay.slice(1);
        
        // Add exercise IDs if available
        let exerciseInfo = '';
        if (stretch.exercises) {
            const exerciseCount = stretch.exercises.split('|').length;
            exerciseInfo = `<div class="exercise-count">${exerciseCount} exercise${exerciseCount > 1 ? 's' : ''}</div>`;
        }
        
        stretchCard.innerHTML = `
            <div class="stretch-header">
                <div class="stretch-type">${displayTimeOfDay}</div>
                <div class="stretch-time">${stretch.duration} min</div>
            </div>
            <h3>${stretch.name}</h3>
            <p>${stretch.description}</p>
            ${exerciseInfo}
            <a href="#" class="btn-stretch" data-stretch-id="${stretch.stretchId}">Start Now</a>
        `;
        
        stretchesContainer.appendChild(stretchCard);
    });
}

function updateFocusAreas(discomfortAreas) {
    const focusTagsContainer = document.querySelector('.focus-tags');
    if (!focusTagsContainer) return;
    
    // Clear existing tags
    focusTagsContainer.innerHTML = '';
    
    // Prioritize areas
    const primaryAreas = discomfortAreas.slice(0, 3);
    const secondaryAreas = discomfortAreas.slice(3, 5);
    const tertiaryAreas = discomfortAreas.slice(5, 7);
    
    // Add primary areas
    primaryAreas.forEach(area => {
        const tag = document.createElement('div');
        tag.className = 'focus-tag primary';
        tag.textContent = formatAreaName(area);
        focusTagsContainer.appendChild(tag);
    });
    
    // Add secondary areas
    secondaryAreas.forEach(area => {
        const tag = document.createElement('div');
        tag.className = 'focus-tag secondary';
        tag.textContent = formatAreaName(area);
        focusTagsContainer.appendChild(tag);
    });
    
    // Add tertiary areas
    tertiaryAreas.forEach(area => {
        const tag = document.createElement('div');
        tag.className = 'focus-tag tertiary';
        tag.textContent = formatAreaName(area);
        focusTagsContainer.appendChild(tag);
    });
    
    // If no discomfort areas were selected, add a default message
    if (discomfortAreas.length === 0) {
        const tag = document.createElement('div');
        tag.className = 'focus-tag primary';
        tag.textContent = 'General Wellness';
        focusTagsContainer.appendChild(tag);
    }
}

function formatAreaName(areaId) {
    // Convert camelCase or dash-case ID to display name
    return areaId
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/-/g, ' ') // Replace dashes with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(' ');
}

function simulateDataLoading() {
    // For demonstration purposes, add a slight delay to simulate data loading
    setTimeout(() => {
        // Add animation class to all elements that should animate in
        document.querySelectorAll('.stretch-card, .stat-card, .feature-card, .exercise-card').forEach(card => {
            card.style.opacity = '1';
        });
    }, 300);
}

function setupEventListeners() {
    // Navigation item click handling
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Prevent default action for demo
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle special cases
            const navId = this.getAttribute('id');
            if (navId === 'nav-profile') {
                window.location.href = 'questionnaire.html';
            } else if (navId === 'nav-stretches') {
                // This would navigate to a stretches page in a real app
                alert('This would take you to the stretches catalog in a complete app.');
            }
        });
    });
    
    // Stretch button click handling
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn-stretch') || e.target.closest('.btn-stretch')) {
            e.preventDefault();
            
            const button = e.target.matches('.btn-stretch') ? e.target : e.target.closest('.btn-stretch');
            const stretchId = button.getAttribute('data-stretch-id');
            
            // Get name of the stretch routine
            const routineName = button.closest('.stretch-card').querySelector('h3').textContent;
            
            // Simple feedback for demo purposes
            alert(`Starting routine: ${routineName}\n\nStretch ID: ${stretchId}\n\nThis would launch the guided stretch experience in a real application.`);
        }
    });
    
    // Exercise button click handling
    document.addEventListener('click', function(e) {
        if (e.target.matches('.btn-view-exercise') || e.target.closest('.btn-view-exercise')) {
            e.preventDefault();
            
            const button = e.target.matches('.btn-view-exercise') ? e.target : e.target.closest('.btn-view-exercise');
            const exerciseId = button.getAttribute('data-exercise-id');
            
            // Get name of the exercise
            const exerciseName = button.closest('.exercise-card').querySelector('h4').textContent;
            
            // Simple feedback for demo purposes
            alert(`Viewing exercise: ${exerciseName}\n\nExercise ID: ${exerciseId}\n\nThis would show detailed exercise instructions in a real application.`);
        }
    });
    
    // Profile pic click for account menu (demo)
    const profilePic = document.querySelector('.profile-pic');
    if (profilePic) {
        profilePic.addEventListener('click', function() {
            alert('Account menu would open here in a real application.');
        });
    }
}

// Add window resize handler for responsive adjustments if needed
window.addEventListener('resize', function() {
    // Implement any needed resize handling
}); 