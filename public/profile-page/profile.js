document.addEventListener('DOMContentLoaded', function() {
  const fullNameContainer = document.getElementById('fullNameContainer');
  const fullNameSpan = document.getElementById('fullName');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const editNameButton = document.getElementById('editNameButton');
  const usernameSpan = document.getElementById('username');
  const emailSpan = document.getElementById('email');
  const dobSpan = document.getElementById('dob');
  const bioTextarea = document.getElementById('bio');
  const socialLinksInput = document.getElementById('socialLinks');
  const additionalInfoTextarea = document.getElementById('additionalInfo');
  const passwordSpan = document.getElementById('password');
  const changePasswordButton = document.getElementById('changePasswordButton');
  const profilePicture = document.getElementById('profilePicture');
  const profilePictureForm = document.getElementById('profilePictureForm');

  let editingName = false;

  // Fetch and display user profile data
  fetchUserProfile()
      .catch(error => console.error('Error fetching user profile:', error));

  // Function to fetch user profile data
  function fetchUserProfile() {
      return fetch('http://localhost:3000/api/profile', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Failed to fetch user profile');
          }
          return response.json();
      })
      .then(data => {
          // Populate profile fields with retrieved data
          fullNameSpan.textContent = `${data.user.first_name} ${data.user.last_name}`;
          firstNameInput.value = data.user.first_name;
          lastNameInput.value = data.user.last_name;
          usernameSpan.textContent = data.user.username;
          emailSpan.textContent = data.user.email;
          dobSpan.textContent = data.user.dob ? new Date(data.user.dob).toLocaleDateString() : '';
          bioTextarea.value = data.user.bio || '';
          socialLinksInput.value = data.user.social_links || '';
          additionalInfoTextarea.value = data.user.additional_info || '';
          passwordSpan.textContent = '********'; // Replace with logic to handle password display securely
          // Optionally, update profile picture src attribute based on data.user.profile_picture
          // profilePicture.src = data.user.profile_picture ? data.user.profile_picture : 'default-profile-picture.png';
      });
  }

  // Function to toggle edit mode for name
  function toggleEditName() {
      editingName = !editingName;
      if (editingName) {
          fullNameSpan.style.display = 'none';
          firstNameInput.style.display = 'inline-block';
          lastNameInput.style.display = 'inline-block';
          editNameButton.textContent = 'Save';
      } else {
          // Perform save operation (e.g., update API call)
          const updatedFirstName = firstNameInput.value.trim();
          const updatedLastName = lastNameInput.value.trim();
          const updatedBio = bioTextarea.value.trim();
          const updatedSocialLinks = socialLinksInput.value.trim();
          const updatedAdditionalInfo = additionalInfoTextarea.value.trim();
          const updatedDob = dobSpan.textContent; // Assuming you handle date format correctly

          // Example: Update profile via fetch API
          fetch('http://localhost:3000/api/profile', {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({ 
                  first_name: updatedFirstName, 
                  last_name: updatedLastName, 
                  dob: updatedDob, 
                  bio: updatedBio, 
                  social_links: updatedSocialLinks, 
                  additional_info: updatedAdditionalInfo 
              })
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to update profile');
              }
              return response.json();
          })
          .then(data => {
              fullNameSpan.textContent = `${data.user.first_name} ${data.user.last_name}`;
              fullNameSpan.style.display = 'inline-block';
              firstNameInput.style.display = 'none';
              lastNameInput.style.display = 'none';
              editNameButton.textContent = 'Edit';
          })
          .catch(error => console.error('Error updating profile:', error));
      }
  }

  // Event listener for edit name button
  editNameButton.addEventListener('click', toggleEditName);

  // Event listener for change password button
  changePasswordButton.addEventListener('click', () => {
      // Implement logic to handle password change UI/UX
      // Example: Show a modal or redirect to a change password page
      console.log('Change password clicked');
  });

  // Event listener for profile picture form submission
  profilePictureForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(profilePictureForm);
      // Example: Handle profile picture upload via fetch API
      fetch('http://localhost:3000/api/upload-profile-picture', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Failed to upload profile picture');
          }
          return response.json();
      })
      .then(data => {
          profilePicture.src = data.profilePictureUrl; // Update profile picture src based on response
      })
      .catch(error => console.error('Error uploading profile picture:', error));
  });

});
