import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Alert, Pressable } from 'react-native';
import Pdf from 'react-native-pdf';
import { VStack, HStack, Box, Text, Heading } from '@/src/components/GluestackUI';
import { Share as ShareIcon, ChevronLeft, Info } from 'lucide-react-native';
import { Icon } from '@/src/components/IconUI';

interface DocumentViewerProps {
    route: {
        params: {
            fileUrl: string;
            localPath: string; // Absolute path from ReactNativeBlobUtil
            fileName: string;
            mimeType?: string;
        };
    };
    navigation: any;
}

const DocumentViewer = ({ route, navigation }: any) => {
    const { fileUrl, fileName, localPath, mimeType } = route.params;
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const handleShare = async () => {
        try {
            //   await Share.open({
            //     title: 'Share Document',
            //     url: `file://${localPath}`, // Native sharing requires file:// prefix
            //     type: mimeType || 'application/pdf',
            //   });
        } catch (error) {
            console.log('Share Error:', error);
        }
    };

    return (
        <VStack style={styles.container}>
            {/* Header with Share Action */}
            {/* <Box style={styles.header}>
                <HStack className="items-center justify-between">
                    <HStack space="md" className="items-center flex-1">
                        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon as={ChevronLeft} size="xl" color="#0f172a" />
                        </Pressable>
                        <VStack className="flex-1">
                            <Heading size="xs" numberOfLines={1}  >{fileName}</Heading>
                        </VStack>
                    </HStack>

                     <Pressable onPress={handleShare} style={styles.shareButton}>
                        <Icon as={ShareIcon} size="sm" color="white" />
                    </Pressable> 
                </HStack>
            </Box> */}

            {/* PDF Engine */}
            <View style={styles.pdfWrapper}>
                <Pdf
                    trustAllCerts={true}
                    source={{
                        uri: localPath,
                        cache: true,


                    }} // Loads directly from app cache
                    onLoadComplete={(numberOfPages) => setTotalPages(numberOfPages)}
                    onPageChanged={(page) => setCurrentPage(page)}
                    onError={(error) => {
                        console.log(error);
                        Alert.alert("Error", "Could not render PDF. Try opening with another app.");
                    }}
                    style={styles.pdf}
                />
            </View>

            {/* Footer with Page Counter */}
            <Box style={styles.footer}>
                <HStack space="sm" className="items-center justify-between">
                    <HStack space="xs" className="items-center">
                        <Icon as={Info} size="xs" color="#64748b" />
                        <Text style={styles.footerText}>Local Encrypted Preview</Text>
                    </HStack>
                    <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
                </HStack>
            </Box>
        </VStack>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#f1f5f9' },
    backButton: { padding: 8, borderRadius: 99 },
    subHeader: { fontSize: 10, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 2 },
    shareButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 16 },
    pdfWrapper: { flex: 1, backgroundColor: '#f8fafc' },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: '#f8fafc'
    },
    footer: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#f1f5f9' },
    footerText: { fontSize: 11, color: '#64748b' },
    pageText: { fontSize: 11, fontWeight: 'bold', color: '#334155' }
});

export default DocumentViewer;