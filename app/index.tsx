import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace('/(tabs)/home');
            } else {
                router.replace('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007bff" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});