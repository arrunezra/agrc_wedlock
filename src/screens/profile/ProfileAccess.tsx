import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import { Box, Spinner, Center } from '@/src/components/common/GluestackUI';
import api from '@/src/api/api';
import { ProfileCard } from './ProfileCard';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '@/src/services/profileService';
import LottieView from 'lottie-react-native';
import NotFoundScreen from '../common/NotFoundScreen';
import FailedScreen from '../common/FailedScreen';
import { SkeletonItem } from '../common/SkeletonItem';
import { useAuth } from '@/src/context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  const navigation = useNavigation<any>();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [filters, setFilters] = useState({
    gender: '',
    marital_status: '',
    annual_income: '',
    min_age: '',
    max_age: ''
  });
  const fetchProfiles = async (pageNumber: number, shouldRefresh = false) => {
    if (loading || (pageNumber > totalPages && !shouldRefresh)) return;

    setLoading(true);
    try {
      // CONVERTED TO POST
      let post = {
        page: pageNumber,
        ...filters // Send all filter values in the body
      }
      console.log('getprofiless', post);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await profileService.getprofile(post, abortControllerRef.current.signal);

      if (response.success) {
        const newData = response.data;
        setProfiles(shouldRefresh ? newData : [...profiles, ...newData]);
        setTotalPages(response.data.totalPages);
        setPage(pageNumber);
      } else {
        if (response.status == 200 && response.message == "Record not found") {
          setProfiles([]);
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchProfiles(1, true);
  }, []);

  // Pull to Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // Do not wait for setPage(1) state to update, pass the value directly
    await fetchProfiles(1, true);
    setPage(1);
  };

  // Load More (Pagination)
  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProfiles(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <Center className="py-10">
        <Spinner size="large" color="$cyan500" />
      </Center>
    );
  };
  const renderContent = () => {
    // Show Skeletons during the very first load or while refreshing
    if (loading && profiles.length === 0) {
      return (
        <Box className="px-4 py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonItem key={i} />
          ))}
        </Box>
      );
    }

    return (
      <FlatList
        data={profiles}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <Box className="px-4">
            <ProfileCard profile={item} user={user} onPress={() => {
              navigation.navigate('ProfileDetail', { id: item.id })
            }} />
          </Box>
        )}
        ListEmptyComponent={!loading ? <NotFoundScreen /> : null}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    );
  };
  return (
    <Box className="flex-1 bg-background-50">
      {renderContent()}
    </Box>
  );
}
//<FailedScreen onRetry={handleRefresh} />