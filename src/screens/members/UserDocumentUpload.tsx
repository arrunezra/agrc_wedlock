import React, { useState, useCallback } from 'react';
import { Platform, ScrollView, Pressable, StatusBar, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import {
    Text, HStack, VStack, Box, Center, Progress, ProgressFilledTrack,
    FormControl,
    FormControlLabel,
    FormControlLabelText
} from "../../components/common/GluestackUI";
import {
    pick, types, isErrorWithCode, errorCodes, DocumentPickerResponse
} from '@react-native-documents/picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {
    UploadCloud, ShieldCheck, File, Trash2, CheckCircle2,
    User,
    MapPin,
    Home
} from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/api/api';
import { FileService } from '@/src/services/Fileservices';
import { useAuth } from '@/src/context/AuthContext';
import { Dropdown } from 'react-native-element-dropdown';
import { AnimateError } from '../common/AnimateError';
import { Icon } from '@/src/components/common/IconUI';
import { useNavigation } from '@react-navigation/native';
import { useAppToast } from '@/src/context/ToastContext';
import HeaderSession from '../common/HeaderSession';

const UserDocumentUpload = () => {
    // State Management
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const { showToast } = useAppToast();
    const [selectedFiles, setSelectedFiles] = useState<DocumentPickerResponse[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [compressionStatus, setCompressionStatus] = useState<string | null>(null);
    const [churchBranches, setChurchBranches] = useState<any[]>([]);
    const [isChurchFocus, setIsChurchFocus] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        userid: '',
        church_id: '',
        church_name: '',
        selected_pastor: '',
        selected_address: ''
    });
    const [errors, setErrors] = useState<any>({});
    const MAX_SIZE = 1024 * 1024; // 1MB Limit

    // --- Logic 1: Pick & Recursive Compression ---
    const onPick = useCallback(async () => {
        try {
            const results: DocumentPickerResponse[] = await pick({
                type: [types.images, types.pdf],
                allowMultiSelection: false,
            });

            setIsLoading(true);

            const processed = await Promise.all(
                results.map(async (file: DocumentPickerResponse) => {
                    const initialSize = file.size ?? 0;

                    // Only compress images that exceed 1MB
                    if (!file.type?.startsWith('image/') || initialSize <= MAX_SIZE) {
                        return file;
                    }

                    let currentUri = file.uri;
                    let currentSize = initialSize;
                    let quality = 0.9;
                    let maxWidth = 1600;
                    let pass = 1;

                    while (currentSize > MAX_SIZE && quality > 0.1) {
                        setCompressionStatus(`Optimizing ${file.name} (Pass ${pass})...`);

                        currentUri = await ImageCompressor.compress(currentUri, {
                            compressionMethod: 'manual',
                            maxWidth: maxWidth,
                            quality: quality,
                            output: 'jpg',
                        });

                        const cleanPath = Platform.OS === 'ios' ? currentUri.replace('file://', '') : currentUri;
                        const stats = await ReactNativeBlobUtil.fs.stat(cleanPath);
                        currentSize = stats.size;

                        quality -= 0.15;
                        maxWidth -= 200;
                        pass++;
                    }

                    return { ...file, uri: currentUri, size: currentSize };
                })
            );

            setSelectedFiles((prev) => [...prev, ...processed]);
        } catch (err: unknown) {
            if (isErrorWithCode(err) && err.code !== errorCodes.OPERATION_CANCELED) {
                Alert.alert("Picker Error", "Could not access files.");
            }
        } finally {
            setIsLoading(false);
            setCompressionStatus(null);
        }
    }, []);

    // --- Logic 2: Single/Batch Upload ---
    const uploadFiles = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const token = await AsyncStorage.getItem('accessToken');

            for (const file of selectedFiles) {
                const uploadData = new FormData();
                const cleanUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;

                uploadData.append('file', {
                    uri: cleanUri,
                    type: file.type || 'application/octet-stream',
                    name: file.name
                } as any);
                uploadData.append('action', 'dms');
                uploadData.append('module', 'profile');
                uploadData.append('userid', user?.userid ?? ""); // Required by your PHP script
                const response = await FileService.uploadFile(uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        //'Authorization': `Bearer ${token}`
                    },
                    onUploadProgress: ({ loaded, total }: any) => {
                        if (total) setUploadProgress(Math.round((loaded * 100) / total));
                    }
                });
                if (response.success) {
                    showToast("File Upload Details", "File uploaded successfully.", "success");

                    setSelectedFiles([]);
                    navigation.navigate("DocumentSummary")
                } else {
                    showToast("Upload Failed", "File upload failed.", "error");
                }
            }


        } catch (error) {
            showToast("Upload Failed", "An error occurred during transfer.", "error");

        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeFile = (uri: string) => {
        setSelectedFiles(prev => prev.filter(f => f.uri !== uri));
    };
    const updateForm = (key: string, value: any) => {
        // 1. Update the form data as usual
        setFormData((prev: any) => ({ ...prev, [key]: value }));

        // 2. Clear the error for this specific field if it exists
        if (errors[key]) {
            setErrors((prevErrors: any) => {
                const newErrors = { ...prevErrors };
                delete newErrors[key]; // Remove the specific error
                return newErrors;
            });
        }
    };
    return (
        <Box className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="File Uploads"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />

            {/* Header */}
            <VStack className="px-6 pt-16 pb-4 bg-white border-b border-slate-100">
                <Text className="text-3xl font-extrabold text-slate-900 text-center">Cloud Vault</Text>
                <HStack className="justify-center items-center mt-2 space-x-1">
                    <ShieldCheck size={14} color="#22c55e" />
                    <Text className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                        1MB Auto-Optimization Active
                    </Text>
                </HStack>
            </VStack>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>

                {/* Bento Upload Box */}
                <Pressable
                    onPress={onPick}
                    disabled={isLoading || isUploading}
                    className={`active:scale-[0.98] transition-all ${isLoading || isUploading ? 'opacity-50' : 'opacity-100'}`}
                >
                    <VStack className="w-full h-48 bg-white rounded-[32px] border-2 border-dashed border-slate-200 items-center justify-center shadow-sm">
                        <Box className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                            <UploadCloud size={32} color="#3b82f6" strokeWidth={1.5} />
                        </Box>
                        <Text className="text-lg font-bold text-slate-900">Tap to Select</Text>
                        <Text className="text-sm text-slate-400">PDFs or Images</Text>
                    </VStack>
                </Pressable>

                {/* Status Messages */}
                {isLoading && (
                    <VStack className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 items-center">
                        <ActivityIndicator size="small" color="#3b82f6" />
                        <Text className="text-blue-900 font-bold mt-2 text-center">{compressionStatus}</Text>
                    </VStack>
                )}

                {isUploading && (
                    <VStack className="mt-6 space-y-2 p-4 bg-white rounded-2xl border border-slate-100">
                        <HStack className="justify-between">
                            <Text className="text-xs font-black text-slate-500 uppercase">Uploading...</Text>
                            <Text className="text-xs font-bold text-blue-600">{uploadProgress}%</Text>
                        </HStack>
                        <Progress value={uploadProgress} className="w-full h-2 bg-slate-100 rounded-full">
                            <ProgressFilledTrack className="bg-blue-500" />
                        </Progress>
                    </VStack>
                )}

                {/* File Queue */}
                <VStack className="mt-8 mb-4">
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                        Queue ({selectedFiles.length})
                    </Text>

                    {selectedFiles.map((file) => (
                        <Animated.View
                            key={file.uri}
                            entering={FadeIn}
                            exiting={FadeOut}
                            layout={LinearTransition.springify()}
                        >
                            <HStack className="bg-white p-4 rounded-2xl items-center mb-3 shadow-sm border border-slate-50">
                                <Center className="w-12 h-12 bg-slate-50 rounded-xl">
                                    <File color="#64748b" size={24} />
                                </Center>
                                <VStack className="flex-1 ml-4 gap-2">
                                    <Text numberOfLines={1} className="text-sm font-bold text-slate-800">{file.name}</Text>
                                    <HStack className="items-center space-x-2 gap-2">
                                        <Text className="text-xs text-slate-400">{(file.size! / 1024).toFixed(0)} KB</Text>
                                        {file.size! <= MAX_SIZE && (
                                            <Box className="bg-green-100 px-1.5 py-0.5 rounded">
                                                <Text className="text-[9px] text-green-700 font-black uppercase">Ready</Text>
                                            </Box>
                                        )}
                                    </HStack>
                                </VStack>
                                <Pressable onPress={() => removeFile(file.uri)} className="p-2">
                                    <Trash2 size={18} color="#ef4444" />
                                </Pressable>
                            </HStack>
                        </Animated.View>
                    ))}
                </VStack>

                {/* Batch Action Button */}
                {selectedFiles.length > 0 && !isLoading && !isUploading && (
                    <Animated.View entering={FadeIn}>
                        <Pressable
                            onPress={uploadFiles}
                            className="bg-blue-600 w-full py-4 rounded-2xl shadow-lg shadow-blue-200 items-center mb-10 active:bg-blue-700"
                        >
                            <HStack space="sm" className="items-center">
                                <Text className="text-white font-bold text-lg">Upload to Cloud</Text>
                                <CheckCircle2 size={20} color="white" />
                            </HStack>
                        </Pressable>
                    </Animated.View>
                )}
            </ScrollView>
        </Box>
    );
};
const styles = StyleSheet.create({
    dropdown: {
        height: 56,
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0', // slate-200
        shadowColor: '#f1f5f9',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 2,
    },
    placeholder: {
        fontSize: 12,
        color: '#94a3b8', // slate-400
    },
    selectedText: {
        fontSize: 14,
        color: '#0f172a', // slate-900
    },
});
export default UserDocumentUpload;