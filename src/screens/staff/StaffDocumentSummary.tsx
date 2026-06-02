import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
    Alert,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { ChevronLeft, Search, SlidersHorizontal, Trash2, XCircle } from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Added navigation

import api from '@/src/api/api';
import { API_BASE_URL_DEV_DMS } from '@/src/utils/environment';
import { getFileIconConfig } from '@/src/utils/common';
import { VStack } from '@/src/components/common/GluestackUI';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import { AddIcon, Icon } from '@/src/components/common/IconUI';
import { useAppToast } from '@/src/context/ToastContext';
import LoadingScreen from '@/src/screens/common/LoadingScreen';
import NotFoundScreen from '../common/NotFoundScreen';
import { useAlert } from '@/src/context/AlertContext';
import HeaderSession from '../common/HeaderSession';

const StaffDocumentSummary = ({ route }: any) => {
    const { profile_id } = route.params;
    const navigation = useNavigation<any>();
    const { showToast } = useAppToast();
    const { showAlert, hideAlert } = useAlert();

    const [files, setFiles] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [defaultLoading, setDefaultLoading] = useState(false);
    const isFirstRender = useRef(true);

    const fetchFiles = useCallback(async (pageNum = 1, isSearching = false) => {
        if (loading) return;
        if (pageNum > 1 && !hasMore && !isSearching) return;

        setLoading(true);
        try {
            const payload = {
                userid: "1",
                search: "",
                page: pageNum,
                limit: 10,
                action: 'staff_doc',
                profile_id: profile_id
            };
            const res = await api.post('/files/profile_myfiles_summary.php', payload);
            if (res.data.success) {
                setFiles((prev) => pageNum === 1 ? res.data.files : [...prev, ...res.data.files]);
                setHasMore(res.data.hasMore);
                setPage(pageNum);
            }
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [hasMore, loading, profile_id]);
    useEffect(() => {
        if (profile_id) {
            fetchFiles(1, false);
        }
    }, [profile_id]); // Trigger when profile_id arrives


    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetchFiles(1, true);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFiles(1, true,);
    };

    // --- NEW: Hybrid Preview Logic ---
    // const handlePreview = async (file: any) => {
    //     setDefaultLoading(true);

    //     const sourceUrl = `${API_BASE_URL_DEV_DMS}/${file.file_name}`;
    //     const extension = file.extension.toLowerCase();
    //     // Create a safe local path
    //     const sanitizedFileName = file?.original_name.replace(/\s+/g, '_');
    //     const localPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${sanitizedFileName}`;
    //     try {
    //         // 1. Download the file via Blob-Util
    //         const res = await ReactNativeBlobUtil.config({
    //             path: decodeURI(localPath),
    //             fileCache: true,

    //         }).fetch('GET', sourceUrl);

    //         setDefaultLoading(false);

    //         // 2. Hybrid Decision Logic
    //         const internalViewable = ['pdf'];

    //         if (internalViewable.includes(extension)) {
    //             // Navigate to your Hybrid Viewer Screen
    //             let localpath = Platform.OS === 'android' ? `file://${res.path()}` : res.path()
    //             const decodedPath = localpath; // Converts %20 back to spaces

    //             navigation.navigate('Main', {
    //                 screen: 'DocumentViewer',
    //                 params: {
    //                     fileUrl: sourceUrl,
    //                     // Ensure the path is a clean string and has the file protocol
    //                     localPath: decodedPath,
    //                     fileName: file.original_name,
    //                     mimeType: file.mime_type
    //                 }
    //             })

    //         } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    //             //if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    //             // If it's just an image, iOS preview is still best
    //             if (Platform.OS === 'ios') {
    //                 ReactNativeBlobUtil.ios.previewDocument(res.path());
    //             } else {
    //                 ReactNativeBlobUtil.android.actionViewIntent(res.path(), 'image/*');
    //             }
    //         } else {
    //             // Fallback for archives/others
    //             ReactNativeBlobUtil.android.actionViewIntent(res.path(), file.mime_type || 'application/octet-stream');
    //         }
    //     } catch (err) {
    //         setDefaultLoading(false);
    //         Alert.alert("Error", "Could not process this file.");
    //     }
    // };
    const handlePreview = async (file: any) => {
        setDefaultLoading(true);

        const sourceUrl = `${API_BASE_URL_DEV_DMS}/${file.file_name}`;
        const extension = file.extension.toLowerCase();

        // 1. Create a unique, safe local path
        // Using file_id or a unique filename is safer than original_name to avoid collisions
        const sanitizedFileName = `${file.file_id}_${file.original_name.replace(/\s+/g, '_')}`;
        const localPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${sanitizedFileName}`;

        try {
            // 2. Check if the file already exists locally
            const exists = await ReactNativeBlobUtil.fs.exists(localPath);

            let finalPath = localPath;

            if (!exists) {
                // 3. Only download if it doesn't exist
                console.log("File not found locally. Downloading...");
                const res = await ReactNativeBlobUtil.config({
                    path: localPath, // Direct path to save
                    fileCache: true,
                }).fetch('GET', sourceUrl);
                finalPath = res.path();
            } else {
                console.log("File exists locally. Opening from cache.");
            }

            setDefaultLoading(false);

            // 4. Formatting path for platform specific viewers
            const platformPath = Platform.OS === 'android' ? `file://${finalPath}` : finalPath;

            // 5. Hybrid Decision Logic
            const internalViewable = ['pdf'];

            if (internalViewable.includes(extension)) {
                navigation.navigate('Main', {
                    screen: 'DocumentViewer',
                    params: {
                        fileUrl: sourceUrl,
                        localPath: platformPath,
                        fileName: file.original_name,
                        mimeType: file.mime_type
                    }
                });
            } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                if (Platform.OS === 'ios') {
                    ReactNativeBlobUtil.ios.previewDocument(finalPath);
                } else {
                    ReactNativeBlobUtil.android.actionViewIntent(finalPath, 'image/*');
                }
            } else {
                // Fallback for other file types
                ReactNativeBlobUtil.android.actionViewIntent(finalPath, file.mime_type || 'application/octet-stream');
            }

        } catch (err) {
            setDefaultLoading(false);
            console.error("Preview Error:", err);
            Alert.alert("Error", "Could not process or download this file.");
        }
    };

    const confirmDelete = async (fileid: any) => {
        try {
            setLoading(true);
            const uploadData = new FormData();
            // uploadData.append('file', {
            //     uri: Platform.OS === 'ios' ? result.uri.replace('file://', '') : result.uri,
            //     type: result.type || 'application/octet-stream',
            //     name: result.name,
            // });
            uploadData.append('action', 'dms_delete');
            uploadData.append('userid', '1');
            uploadData.append('module', 'profile');
            uploadData.append('file_id', fileid);
            uploadData.append('profile_id', profile_id);

            const token = await AsyncStorage.getItem('accessToken');
            const response = await api.post('/files/dms_file_upload.php', uploadData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                showToast("File Deleted", "File deleted successfully.", "success");

                fetchFiles(1, true);
            } else {
                showToast("Failed", "File deleted failed.", "error");

            }
        } catch (error) {
            if (!isErrorWithCode(error) || error.code !== errorCodes.OPERATION_CANCELED) {
                Alert.alert("Upload Error", "Failed to delete file.");
            }
        } finally {
            setLoading(false);
        }
    }
    const handledelete = async (fileid: any) => {

        showAlert({
            type: 'warning',
            title: 'Delete Profile?',
            message: 'Are you sure you want to delete your profile?',
            confirmText: "Delete",
            onConfirm: async () => {
                hideAlert();
                confirmDelete(fileid);

            }
        });


    }
    const handleReplace = async (existingGuid: any) => {
        try {
            const [result] = await pick({ type: [types.allFiles] });
            if (!result) return;

            setLoading(true);
            const uploadData = new FormData();
            uploadData.append('file', {
                uri: Platform.OS === 'ios' ? result.uri.replace('file://', '') : result.uri,
                type: result.type || 'application/octet-stream',
                name: result.name,
            });
            uploadData.append('action', 'dms_replace');
            uploadData.append('module', 'profile');
            uploadData.append('userid', "1");

            uploadData.append('file_id', existingGuid);

            const token = await AsyncStorage.getItem('accessToken');
            const response = await api.post('/files/upload.php', uploadData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                Alert.alert("Success", "File replaced successfully");
                fetchFiles(1, true);
            }
        } catch (error) {
            if (!isErrorWithCode(error) || error.code !== errorCodes.OPERATION_CANCELED) {
                Alert.alert("Upload Error", "Failed to replace file.");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderFileItem = ({ item }: any) => {
        const { Icon, bgClass, iconColor } = getFileIconConfig(item.extension);
        const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePreview(item)}
                className="flex-row items-center mb-4 mx-5 p-4 bg-white rounded-[24px] border border-slate-100 shadow-sm"
            >
                <View className={`w-14 h-14 rounded-2xl items-center justify-center ${bgClass}`}>
                    <Icon size={26} color={iconColor} strokeWidth={2} />
                </View>

                <View className="flex-1 ml-4">
                    <Text numberOfLines={1} className="text-[16px] font-bold text-slate-900">
                        {item.original_name}
                    </Text>
                    <VStack className="mt-1">
                        <Text className="text-[12px] text-slate-500 font-medium">
                            {item.extension.toUpperCase()} • {(item.file_size / 1024).toFixed(0)} KB
                        </Text>
                        <Text className="text-[11px] text-slate-400 italic">
                            Uploaded on {formattedDate}
                        </Text>
                    </VStack>
                </View>

                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
                    onPress={() => {
                        //handleReplace(item.file_id)
                        handledelete(item.file_id)
                    }}
                >
                    <Trash2 size={24} color="#ff0000ff" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">

            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Documents View"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.navigate("BaptismRecords")}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />

            {files.length > 0 ? <FlatList
                data={files}
                keyExtractor={(item: any) => item.file_id.toString()}
                renderItem={renderFileItem}
                contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
                onEndReached={() => hasMore && fetchFiles(page + 1)}
                onEndReachedThreshold={0.3}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={!loading ? <View className="mt-20 items-center"><Text className="text-slate-400">No documents found</Text></View> : null}
            />
                : <VStack className="flex-1 justify-center  bg-white  ">
                    <NotFoundScreen title="Records not found" description="Recent Upload Profiles" />
                </VStack>
            }
            {/* {files.length < 5 && <MotiView
                from={{ scale: 0, opacity: 0, translateY: 50 }}
                animate={{ scale: 1, opacity: 1, translateY: 0 }}
                transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 150,
                    delay: 400
                }}
                className="absolute bottom-8 right-8"
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                        navigation.navigate("UserDocumentUpload"
                        )
                    }
                    // Added rounded-full and overflow-hidden here
                    className="h-20 w-20 rounded-full overflow-hidden shadow-2xl shadow-cyan-500/50"
                    style={{ elevation: 10 }}
                >
                    <LinearGradient
                        colors={['#26dda0ff', '#0a6d4fff']}
                        // Ensure the gradient also has rounded-full
                        className="h-full w-full rounded-full items-center justify-center"
                    >
                        <Icon as={AddIcon} size="xl" className="text-cyan-400" style={{ width: 38, height: 38 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </MotiView>} */}
            {loading && page === 1 && !refreshing && (
                <View style={StyleSheet.absoluteFill} className="bg-white/60 items-center justify-center z-50">
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}
            {defaultLoading && <LoadingScreen />}
        </View>
    );
};

export default StaffDocumentSummary;