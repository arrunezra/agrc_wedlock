import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar, Pressable, Platform } from 'react-native';
import {
    pick,
    types,
    DocumentPickerResponse,
    isErrorWithCode,
    errorCodes
} from '@react-native-documents/picker';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { UploadCloud, File, Trash2, ShieldCheck } from 'lucide-react-native';
import api from '@/src/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DMSUploadScreen = () => {
    // 1. Updated Type to DocumentPickerResponse
    const [selectedFiles, setSelectedFiles] = useState<DocumentPickerResponse[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    useEffect(() => {
        uploadFiles();



    }, [selectedFiles]);
    const uploadFiles = async () => {
        try {
            // 1. Open Document Picker
            // Note: 'cropping' is NOT supported in this library.
            const results = await pick({
                type: [types.images],
                allowMultiSelection: false,
            });

            // 2. Extract the first (and only) file
            const image = results[0];
            if (!image) return;

            // 3. Prepare FormData
            const uploadData = new FormData();

            // In 2026, the 'uri' from the picker is modern and usually doesn't need 
            // manual 'file://' stripping on iOS, but we'll keep the logic for consistency.
            const cleanUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;

            uploadData.append('file', {
                uri: cleanUri,
                type: image.type || 'image/jpeg', // Matches the new .type property
                name: image.name
            } as any);

            uploadData.append('action', 'dms');
            // if (existingGuid) {
            //     uploadData.append('file_guid', existingGuid);
            // }
            // 4. Start Upload
            setIsUploading(true);
            setUploadProgress(0);

            const token = await AsyncStorage.getItem('accessToken');
            const response = await api.post('/files/dms_file_upload.php', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                onUploadProgress: ({ loaded, total }: any) => {
                    if (total) {
                        setUploadProgress(Math.round((loaded * 100) / total));
                    }
                }
            });

            if (response.data.success) {
                console.log(response.data);

                // 4. Update UI with cache buster
                const newUrl = `${response.data.data.file_name}?t=${Date.now()}`; // Important

                console.log("File Processed with GUID:", response.data.data.guid);


            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error: any) {
            // 5. Modern Error Handling using error codes
            if (isErrorWithCode(error)) {
                if (error.code === errorCodes.OPERATION_CANCELED) {
                    console.log("User cancelled selection");
                } else {
                    console.error("Picker Error:", error.code);
                }
            } else {
                console.error("Upload process error:", error);
            }
        } finally {
            setIsUploading(false);
        }
    };
    const onPick = useCallback(async () => {
        try {
            const results = await pick({
                //type: [types.allFiles, types.images, types.pdf],
                allowMultiSelection: true,
            });

            setSelectedFiles((prev) => [...prev, ...results]);
        } catch (err: unknown) {
            // 2. Updated Cancel Handling for 2026
            if (isErrorWithCode(err)) {
                if (err.code === errorCodes.OPERATION_CANCELED) {
                    console.log('User cancelled the picker');
                } else if (err.code === errorCodes.IN_PROGRESS) {
                    console.warn('Picker is already open');
                } else {
                    console.error('Picker Error:', err.code, err.message);
                }
            } else {
                console.error('Unknown Error:', err);
            }
        }
    }, []);

    const removeFile = (uri: string) => {
        setSelectedFiles(prev => prev.filter(f => f.uri !== uri));
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.title}>Cloud Vault</Text>
                <View style={styles.badge}>
                    <ShieldCheck size={14} color="#34C759" />
                    <Text style={styles.badgeText}>End-to-End Encrypted</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.bentoGrid}>
                    <TouchableOpacity
                        onPress={onPick}
                        style={[styles.bentoBox, styles.largeBox]}
                        activeOpacity={0.9}
                    >
                        <UploadCloud size={40} color="#007AFF" strokeWidth={1.5} />
                        <Text style={styles.boxLabel}>Tap to Upload</Text>
                        <Text style={styles.boxSub}>PDF, Images, or Zip</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listSection}>
                    <Text style={styles.sectionHeader}>Queue ({selectedFiles.length})</Text>
                    {selectedFiles.map((file) => (
                        <Animated.View
                            key={file.uri}
                            entering={FadeIn.duration(400)}
                            exiting={FadeOut}
                            layout={LinearTransition.springify()}
                            style={styles.fileRow}
                        >
                            <View style={styles.fileIcon}>
                                <File color="#8E8E93" size={24} />
                            </View>
                            <View style={styles.fileDetails}>
                                <Text numberOfLines={1} style={styles.fileName}>{file.name ?? 'Untitled'}</Text>
                                {/* 3. Handle nullable size safely */}
                                <Text style={styles.fileMeta}>
                                    {file.size ? (file.size / 1024).toFixed(0) : '0'} KB
                                </Text>
                            </View>
                            <Pressable onPress={() => removeFile(file.uri)} style={styles.deleteBtn}>
                                <Trash2 size={18} color="#FF3B30" />
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F8F9FB' },
    header: { paddingHorizontal: 24, paddingTop: 60, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: '800', color: '#1A1A1A' },
    badge: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    badgeText: { fontSize: 12, color: '#34C759', marginLeft: 4, fontWeight: '600' },
    scrollContent: { paddingHorizontal: 20 },
    bentoGrid: { marginBottom: 30 },
    bentoBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        // 2026 Soft Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    largeBox: { height: 200, borderStyle: 'dashed', borderWidth: 2, borderColor: '#D1D1D6' },
    boxLabel: { fontSize: 18, fontWeight: '700', marginTop: 12, color: '#1A1A1A' },
    boxSub: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
    listSection: { marginTop: 10 },
    sectionHeader: { fontSize: 14, fontWeight: '700', color: '#8E8E93', marginBottom: 15, textTransform: 'uppercase' },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    fileIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    fileDetails: { flex: 1, marginLeft: 12 },
    fileName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
    fileMeta: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    deleteBtn: { padding: 8 },
});

export default DMSUploadScreen;