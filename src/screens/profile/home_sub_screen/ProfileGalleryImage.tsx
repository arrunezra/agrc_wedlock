import React, { useState, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Box, HStack, Spinner, Text, } from '@/src/components/GluestackUI';
import FastImage from '@d11/react-native-fast-image';
import { API_BASE_URL_DEV_Profiles_Images } from '@/src/utils/environment';
import { CheckCircleIcon, StarIcon, TrashIcon } from 'lucide-react-native';

const ProfileGalleryImage = ({ item, index, COLUMN_WIDTH, onDefault, onDelete, onPreview }: any) => {
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleAction = async (type: 'default' | 'delete') => {
        setIsActionLoading(true);
        try {
            if (type === 'default') {
                await onDefault(item.id);
            } else {
                await onDelete(item.id);
            }
        } finally {
            setIsActionLoading(false);
        }
    };
    return (
        <Box
            style={{ width: COLUMN_WIDTH, height: index === 0 ? 280 : 200 }}
            className="rounded-[24px] overflow-hidden bg-slate-200 relative shadow-sm"
        >

            {/* 1. The Main Image */}
            <Pressable onPress={() => onPreview(index)} className="flex-1">
                <FastImage
                    source={{ uri: `${API_BASE_URL_DEV_Profiles_Images}/${item.uri}` }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
                {/* Subtle Dark Overlay at bottom to help text stand out */}
                <Box className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
            </Pressable>

            {/* Loading Overlay - Blur or semi-transparent Box */}
            {isActionLoading && (
                <Box className="absolute inset-0 z-50 bg-black/40 items-center justify-center">
                    <Spinner size="small" color="white" />
                </Box>
            )}

            {/* 2. Top-Left: Status Badge (Pending or Primary) */}
            <Box className="absolute top-3 left-3">
                {item.isDefault ? (
                    <Box className="bg-emerald-500 px-2 py-1 rounded-lg flex-row items-center gap-1 shadow-sm">
                        <StarIcon size={10} color="white" fill="white" />
                        <Text className="text-[10px] text-white font-bold uppercase">Profile</Text>
                    </Box>
                ) : !item.isVerified && (
                    <Box className="bg-amber-500/90 px-2 py-1 rounded-lg shadow-sm">
                        <Text className="text-[10px] text-white font-bold">PENDING</Text>
                    </Box>
                )}
            </Box>

            {/* 3. Bottom Actions: Left (Label) and Right (Icon) */}
            <Box className="absolute bottom-3 left-3 right-3 flex-row justify-between items-center">
                {isActionLoading ? (
                    // Show nothing here while loading, as the main Spinner overlay takes over
                    <Box />
                ) : (
                    <>{!item.isDefault && item.isVerified ? (
                        <Pressable
                            onPress={() => handleAction('default')}
                            className="bg-white px-3 py-1.5 rounded-full shadow-md "
                        >
                            <Text className="text-emerald-600 text-[10px] font-bold uppercase">Set Profile</Text>
                        </Pressable>
                    ) : (
                        <Box />
                    )}
                    </>
                )}
                <Pressable
                    onPress={() => handleAction('delete')}
                    className="bg-red-500 p-2 rounded-full shadow-md "
                >
                    <TrashIcon size={14} color="white" />
                </Pressable>
            </Box>
        </Box>
    );
};

export default ProfileGalleryImage;