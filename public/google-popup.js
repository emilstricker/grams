"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var config_1 = require("./config");
(0, app_1.initializeApp)(config_1.firebaseConfig);
var auth = (0, auth_1.getAuth)();
if (window.location.hostname === 'localhost') {
    (0, auth_1.connectAuthEmulator)(auth, 'http://127.0.0.1:9099');
}
var signInButton = document.getElementById('quickstart-sign-in');
var oauthToken = document.getElementById('quickstart-oauthtoken');
var signInStatus = document.getElementById('quickstart-sign-in-status');
var accountDetails = document.getElementById('quickstart-account-details');
/**
 * Function called when clicking the Login/Logout button.
 */
function toggleSignIn() {
    if (!auth.currentUser) {
        var provider = new auth_1.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        (0, auth_1.signInWithPopup)(auth, provider)
            .then(function (result) {
            if (!result)
                return;
            var credential = auth_1.GoogleAuthProvider.credentialFromResult(result);
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = credential === null || credential === void 0 ? void 0 : credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            oauthToken.textContent = token !== null && token !== void 0 ? token : '';
        })
            .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            if (errorCode === 'auth/account-exists-with-different-credential') {
                alert('You have already signed up with a different auth provider for that email.');
                // If you are using multiple auth providers on your app you should handle linking
                // the user's accounts here.
            }
            else {
                console.error(error);
            }
        });
    }
    else {
        (0, auth_1.signOut)(auth);
    }
    signInButton.disabled = true;
}
// Listening for auth state changes.
(0, auth_1.onAuthStateChanged)(auth, function (user) {
    if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
        signInStatus.textContent = 'Signed in';
        signInButton.textContent = 'Sign out';
        accountDetails.textContent = JSON.stringify(user, null, '  ');
    }
    else {
        // User is signed out.
        signInStatus.textContent = 'Signed out';
        signInButton.textContent = 'Sign in with Google';
        accountDetails.textContent = 'null';
        oauthToken.textContent = 'null';
    }
    signInButton.disabled = false;
});
signInButton.addEventListener('click', toggleSignIn, false);
