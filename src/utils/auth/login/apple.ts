import {
	getAuth,
	signInWithCredential,
	UserCredential,
	AppleAuthProvider,
} from '@react-native-firebase/auth';
import {
	appleAuth,
	appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

async function signInWithApple(): Promise<UserCredential> {
	// Start the sign-in request
	const appleAuthRequestResponse = await appleAuth.performRequest({
		requestedOperation: appleAuth.Operation.LOGIN,
		// As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
		// See: https://github.com/invertase/react-native-apple-authentication#faqs
		requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
	});

	// Ensure Apple returned a user identityToken
	if (!appleAuthRequestResponse.identityToken) {
		throw new Error('Apple Sign-In failed - no identify token returned');
	}

	// Create a Firebase credential from the response
	const { identityToken, nonce } = appleAuthRequestResponse;
	const appleCredential = AppleAuthProvider.credential(identityToken, nonce);

	// Sign the user in with the credential
	return signInWithCredential(getAuth(), appleCredential);
}

async function signInWithAppleAndroid(): Promise<UserCredential> {
	// Generate secure, random values for state and nonce
	const rawNonce = uuid();
	const state = uuid();

	// Configure the request
	appleAuthAndroid.configure({
		// The Service ID you registered with Apple
		clientId: 'dev.douglasndm.thepetgallery.android',

		// Return URL added to your Apple dev console. We intercept this redirect, but it must still match
		// the URL you provided to Apple. It can be an empty route on your backend as it's never called.
		redirectUri:
			'https://the-pet-gallery-48ac6.firebaseapp.com/__/auth/handler',

		// The type of response requested - code, id_token, or both.
		responseType: appleAuthAndroid.ResponseType.ALL,

		// The amount of user information requested from Apple.
		scope: appleAuthAndroid.Scope.ALL,

		// Random nonce value that will be SHA256 hashed before sending to Apple.
		nonce: rawNonce,

		// Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
		state,
	});

	// Open the browser window for user sign in
	const response = await appleAuthAndroid.signIn();

	// Send the authorization code to your backend for verification
	// Create a Firebase credential from the response
	const { id_token, nonce } = response;

	if (!id_token) {
		throw new Error('Apple Sign-In failed - no identify token returned');
	}

	const appleCredential = AppleAuthProvider.credential(id_token, nonce);

	// Sign the user in with the credential
	return signInWithCredential(getAuth(), appleCredential);
}

export { signInWithApple, signInWithAppleAndroid };
