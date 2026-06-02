import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Search, SlidersHorizontal, RefreshCw, FileText, FileSpreadsheet, FileArchive, FileImage, File } from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/src/api/api';
import { API_BASE_URL_DEV_DMS } from '@/src/utils/environment';
import { useAuth } from '@/src/context/AuthContext';
import LoadingScreen from '../common/LoadingScreen';
import { getFileIconConfig } from '@/src/utils/common';



const DMSSummaryScreen = () => {

    const [files, setFiles] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [defaultLoading, setDefaultLoading] = useState(false);
    // --- 2. Optimized Fetch Logic ---
    // We pass currentSearch as a parameter to avoid closure issues with searchQuery state
    const fetchFiles = useCallback(async (pageNum = 1, isSearching = false, currentSearch = searchQuery) => {
        if (loading) return;
        if (pageNum > 1 && !hasMore && !isSearching) return;

        setLoading(true);
        try {
            const payload = {
                userid: "1", // Replace with your dynamic User ID logic
                search: currentSearch,
                page: pageNum,
                limit: 10,
                action: 'staff'
            };

            const res = await api.post('/files/get_dms_summary.php', payload);

            if (res.data.success) {
                setFiles((prev: any) => pageNum === 1 ? res.data.files : [...prev, ...res.data.files]);
                setHasMore(res.data.hasMore);
                setPage(pageNum);
            }
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [hasMore, loading, searchQuery]);

    // Initial Load
    useEffect(() => {
        fetchFiles(1, false, "");
    }, []);

    // Debounced Search Trigger
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFiles(1, true, searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFiles(1, true, searchQuery);
    };

    // --- 3. Functional Logic (Preview & Replace) ---
    const handlePreview = async (file: any) => {
        setDefaultLoading(true)
        console.log('handlePreview file=', file);
        const sourceUrl = `${API_BASE_URL_DEV_DMS}/${file.file_name}`;
        const localPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${file.original_name}`;
        console.log('sourceUrl', sourceUrl)

        console.log('localPath', localPath)
        // const exists = await ReactNativeBlobUtil.fs.exists(localPath);
        //  if (exists) {
        //     Alert.alert('Yes')
        // } else Alert.alert('No')
        try {
            const res = await ReactNativeBlobUtil.config({
                path: localPath,
                fileCache: true,
            }).fetch('GET', sourceUrl);
            setDefaultLoading(false)

            if (Platform.OS === 'ios') {
                ReactNativeBlobUtil.ios.previewDocument(res.path());
            } else {
                ReactNativeBlobUtil.android.actionViewIntent(res.path(), file.mime_type || 'application/octet-stream');
            }
        } catch (err) {
            Alert.alert("Error", "Could not open this file.");
            setDefaultLoading(false)

        }
    };

    const handleReplace = async (existingGuid: string) => {
        try {
            console.log("existingGuid", existingGuid);
            const [result] = await pick({ type: [types.allFiles] });
            if (!result) return;

            setLoading(true);
            const uploadData = new FormData();
            uploadData.append('file', {
                uri: Platform.OS === 'ios' ? result.uri.replace('file://', '') : result.uri,
                type: result.type || 'application/octet-stream',
                name: result.name,
            } as any);

            uploadData.append('userid', "1");
            uploadData.append('file_id', existingGuid);

            const token = await AsyncStorage.getItem('accessToken');
            const response = await api.post('/files/upload.php', uploadData, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.data.success) {
                Alert.alert("Success", "File replaced successfully");
                fetchFiles(1, true, searchQuery);
            }
        } catch (error: any) {
            if (!isErrorWithCode(error) || error.code !== errorCodes.OPERATION_CANCELED) {
                Alert.alert("Upload Error", "Failed to replace file.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- 4. Render Components ---
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
                    <View className="mt-1">
                        <Text className="text-[12px] text-slate-500 font-medium">
                            {item.extension.toUpperCase()} • {(item.file_size / 1024).toFixed(0)} KB
                        </Text>
                        <Text className="text-[11px] text-slate-400 italic">
                            Uploaded on {formattedDate}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
                    onPress={() => handleReplace(item.file_guid)}
                >
                    <RefreshCw size={18} color="#64748b" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };
    const handleLoadMore = () => {
        // 2. Added isMoreLoading check to prevent "Double Fetching"
        if (!hasMore) {
            const nextPage = page + 1;
            fetchFiles(nextPage, true);
        }
    };
    return (
        <View className="flex-1 bg-slate-50">
            {/* Search Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-100">
                <Text className="text-2xl font-black text-slate-900 mb-4">My Documents</Text>
                <View className="flex-row items-center">
                    <View className="flex-1 flex-row items-center bg-slate-100 rounded-2xl px-4 py-2">
                        <Search size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Search documents..."
                            className="flex-1 ml-3 text-slate-900 text-[15px] py-1"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    <TouchableOpacity className="ml-3 w-11 h-11 bg-slate-100 rounded-2xl items-center justify-center">
                        <SlidersHorizontal size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main List */}
            <FlatList
                data={files}
                keyExtractor={(item: any) => item.file_id.toString()}
                renderItem={renderFileItem}
                contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    loading && page > 1 ? <ActivityIndicator size="small" color="#007AFF" className="py-4" /> : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View className="mt-20 items-center">
                            <Text className="text-slate-400 font-medium">No documents found</Text>
                        </View>
                    ) : null
                }
            />

            {/* Full Screen Loading Overlay for Uploads/Initial Fetch */}
            {loading && page === 1 && !refreshing && (
                <View style={StyleSheet.absoluteFill} className="bg-white/60 items-center justify-center z-50">
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            )}
            {defaultLoading && <LoadingScreen />}
        </View>
    );
};

export default DMSSummaryScreen;

