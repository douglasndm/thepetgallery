import {
	getAuth,
	UserCredential,
	GoogleAuthProvider,
	signInWithCredential,
} from '@react-native-firebase/auth';
import {
	GoogleSignin,
	isSuccessResponse,
	isErrorWithCode,
	statusCodes,
} from '@react-native-google-signin/google-signin';

async function signInWithGoogle(): Promise<UserCredential> {
	try {
		// Check if your device supports Google Play
		await GoogleSignin.hasPlayServices({
			showPlayServicesUpdateDialog: true,
		});
		// Get the users ID token
		const signInResult = await GoogleSignin.signIn();

		if (isSuccessResponse(signInResult)) {
			console.log(signInResult);
			// Try the new style of google-sign in result, from v13+ of that module
			let idToken = signInResult.data?.idToken;

			if (!idToken) {
				throw new Error('No ID token found');
			}

			if (!signInResult || !signInResult.data) {
				throw new Error('No ID token found');
			}

			// Create a Google credential with the token
			const googleCredential = GoogleAuthProvider.credential(
				signInResult.data.idToken
			);

			// Sign-in the user with the credential
			return signInWithCredential(getAuth(), googleCredential);
		}

		throw new Error('No ID token found');
	} catch (error) {
		if (isErrorWithCode(error)) {
			console.log(error.message);
			switch (error.code) {
				case statusCodes.IN_PROGRESS:
					// operation (eg. sign in) already in progress
					break;
				case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
					// Android only, play services not available or outdated
					break;
				default:
				// some other error happened
			}
		}

		throw error;
	}
}

export { signInWithGoogle };
