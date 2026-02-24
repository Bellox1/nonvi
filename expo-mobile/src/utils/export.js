import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_URL = 'http://192.168.123.181:8000/api/v1'; // Should match client.js

let exportInProgress = false;

export const exportToCsv = async (endpoint, filename) => {
    if (exportInProgress) {
        return;
    }

    exportInProgress = true;
    try {
        const token = await AsyncStorage.getItem('auth_token');
        const fileUri = FileSystem.documentDirectory + `${filename}.csv`;

        const response = await FileSystem.downloadAsync(
            `${API_URL}/${endpoint}`,
            fileUri,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/csv',
                },
            }
        );

        if (response.status === 200) {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Succès', 'Fichier exporté : ' + fileUri);
            }
        } else {
            Alert.alert('Erreur', 'Impossible de télécharger le fichier (Status: ' + response.status + ')');
        }
    } catch (error) {
        console.error('Export error:', error);
        Alert.alert('Erreur', 'L\'exportation a échoué');
    } finally {
        exportInProgress = false;
    }
};
