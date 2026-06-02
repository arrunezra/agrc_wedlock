import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from "@d11/react-native-fast-image";

import { Box, VStack, HStack, Heading, Text, Button, ButtonIcon } from '@/src/components/common/GluestackUI';
import { Briefcase, Heart, Icon, MapPin } from '@/src/components/common/IconUI';
import profileService from '@/src/services/profileService';
import { API_BASE_URL_DEV_Profiles_Images, API_BASE_URL_DEV_Profiles_Thumbs } from '@/src/utils/environment';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Check, CheckCircle2Icon, CheckCircleIcon, HeartIcon, UserPlus, UsersIcon, X, XCircleIcon } from 'lucide-react-native';
import { formatHeight } from '@/src/utils/common';
import { useFocusEffect } from '@react-navigation/native';
import _, { constant } from 'lodash';
import { MotiView } from 'moti';
import { useAlert } from '@/src/context/AlertContext';
import { useIsFocused } from '@react-navigation/native'; // Add this import
export const ProfileCard = ({ profile, onPress, user, showToast, onActionComplete, comingFrom, reload }: any) => {
  const { showAlert, hideAlert } = useAlert();
  const isFocused = useIsFocused();
  profile = _.cloneDeep(profile);
  const [cardComingFrom, setCardComingFrom] = useState<boolean>(false)
  const [isLiked, setIsLiked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [connectStatus, setConnectStatus] = useState(profile?.connection_status);
  const [sent, setSent] = useState('');
  const [received, setReceived] = useState(profile.received_status);


  // 1. Get Screen Height to calculate dynamic card size
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const CARD_HEIGHT = SCREEN_HEIGHT * 0.72; // 70% of screen height

  useEffect(() => {
    let comingFroms = comingFrom || "";

    if (comingFroms === 'accepted') {
      setCardComingFrom(true)
    } else setCardComingFrom(false)

  }, [comingFrom]);




  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsLiked(profile.is_liked_by_me === 1);
    }, 100);
  }, [profile.is_liked_by_me]);



  useEffect(() => {
    // console.log('Syncing status:', profile.sent_status, profile.received_status);
    setSent(profile.sent_status);
    setReceived(profile.received_status);
  }, [profile.sent_status, profile.received_status]);



  useEffect(() => {
    setConnectStatus(profile.connection_status);
  }, [profile.connection_status]);

  if (!isReady) {
    return <Box className="flex-1 bg-white" />; // Empty white screen during transition
  }
  const commonapicall = async (action: string) => {
    // Use 'dislike' action to delete the row in profiles_interests
    //{ profile_id: profile.profile_id }
    console.log('bosy', {
      action: action?.toLowerCase(),
      target_id: profile?.profile_id
    })
    const response = await profileService.handle_interest_block_actions({
      action: action?.toLocaleLowerCase(),
      target_id: profile?.profile_id
    });

    if (response.success) {
      setSent(response?.status); // Reset local status
      setConnectStatus(null);
      if (action != 'likes') {
        setIsLiked(response.isLiked);
        showToast(action, response.message, "success");

      } else {
        return response;
      }
    } else {

    }
  }
  const sendConnectRequst = async (action: string) => {
    try {
      // 1. WITHDRAW LOGIC: If already 'Pending', clicking again triggers a withdrawal
      if (sent === 'Pending' || action == 'Rejected') { //sent_status
        showAlert({
          type: 'success',
          title: action == 'Rejected' ? 'Rejected' : 'Withdraw Request?',
          message: `Would you like to cancel your connection request to ${profile.full_name}?`,
          confirmText: action == 'Rejected' ? 'Rejected' : 'Yes, Withdraw',
          onConfirm: async () => {
            hideAlert();
            await commonapicall(action == 'Rejected' ? action : 'cancel_request')
          }
        });
        return;
      } else {
        await commonapicall(action)
      }


    } catch (error) {
      console.error("Connection action failed", error);
      showToast("Error", "Something went wrong", "error");
    }
  };
  // const handleResponse = async (action: 'Accepted' | 'Rejected') => {
  //   try {
  //     // 1. Call the API and wait for the result
  //     const res = await profileService.respondToInterest({
  //       sender_id: profile.profile_id,
  //       action: action
  //     });

  //     if (res.success) {
  //       // 2. Update the local UI state
  //       // This will trigger your getStatusUI() helper to re-render the button
  //       setConnectStatus(action);

  //       // 3. Optional Feedback
  //       if (action === 'Accepted') {
  //         showToast("Success", "Connection established! You can now message them.", "success");

  //       } else {
  //         showToast("Declined", "Request removed.", "success");
  //       }
  //       setReceived(action);
  //     } else {
  //       showToast("Note", res.message || "Failed to process request", "error");

  //     }
  //   } catch (error) {
  //     console.error("HandleResponse Error:", error);
  //   }
  // };
  const getStatusUI = () => {

    // 1. Check if either direction is "Accepted"
    // 2. sent = sent_status
    // 3. received = received_status
    if (sent === 'Accepted' || received === 'Accepted') {
      return { text: 'Connected', color: 'bg-emerald-600', icon: CheckCircleIcon, disabled: true, showLabel: false };
    }

    // 2. Check for Rejections (Handle this early to lock the button)
    if (sent === 'Rejected' || received === 'Rejected') {
      return { text: 'Declined', color: 'bg-slate-500', icon: XCircleIcon, disabled: true, showLabel: true };
    }

    // 3. Check if you sent a request
    if (sent === 'Pending') {
      return { text: 'Cancel Req.', color: 'bg-black/50', icon: CheckCircle2Icon, disabled: false, showLabel: true };
    }

    // 4. Check if they sent you a request
    if (received === 'Pending') {
      return { text: 'Wants to Connect', color: 'bg-indigo-600', icon: UserPlus, disabled: false, showLabel: true };
    }

    // 5. No relationship
    return { text: 'Connect', color: 'bg-black/50', icon: CheckCircle2Icon, disabled: false, showLabel: true };
  };
  const handleLike = async () => {
    try {
      // 1. Optimistic Update (make it feel fast)
      const previousState = isLiked;
      setIsLiked(!previousState);

      // 2. Call API
      const res = await commonapicall('likes')
      //const res = await profileService.toggleLike({ profile_id: profile.profile_id });

      if (!res.success) {
        // Rollback if API fails
        setIsLiked(previousState);
        Alert.alert("Error", "Could not update like status");
      } else {
        // Set the actual state from server (true or false)
        setIsLiked(res.isLiked);
      }
      if (onActionComplete) { // Coming from FavoritesScreen
        onActionComplete();

      }
    } catch (error) {
      setIsLiked(!isLiked); // Rollback
      console.error(error);
    }
  }
  const ui = getStatusUI();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95} className="mx-2 mb-8">
      <Box
        style={{ height: CARD_HEIGHT }}
        className="w-full rounded-[40px] overflow-hidden shadow-2xl bg-background-100 border border-white/20"
      >
        {/* 1. Background Image */}
        {profile.file_name ? (
          <FastImage
            source={{
              uri: `${API_BASE_URL_DEV_Profiles_Images}/${profile.file_name}`,
              priority: FastImage.priority.high,
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <Box className="flex-1 justify-center items-center bg-slate-100">
            <LottieView
              source={require('../../assets/animations/default_profile.json')}
              autoPlay
              loop
              style={{ width: '70%', height: '70%' }}
            />
          </Box>
        )}

        {/* 2. Top Action Bar */}
        {!cardComingFrom ? <HStack className="absolute top-2 left-6 right-6 justify-between items-center">
          {/* CASE 1: They sent YOU a request -> Show Accept/Reject */}
          {received === 'Pending' && !sent && (
            <HStack space="md" className="items-center">
              <TouchableOpacity
                onPress={() => sendConnectRequst('Rejected')}
                className="bg-slate-200/90 p-3 rounded-full border border-white/20 shadow-sm"
              >
                <Icon as={X} size="xs" className="text-slate-800" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => sendConnectRequst('Accepted')}
                className="bg-indigo-600 px-5 py-2.5 rounded-full flex-row items-center gap-2 shadow-lg border border-indigo-400"
              >
                <Icon as={Check} size="xs" className="text-white" />
                <Text className="text-white text-[11px] font-bold uppercase">Accept</Text>
              </TouchableOpacity>
            </HStack>
          )}

          {/* CASE 2: No incoming request -> Show standard Connect/Requested/Connected button */}
          {!(received === 'Pending' && !sent) && (
            <TouchableOpacity
              onPress={() => sendConnectRequst('send_request')}
              activeOpacity={0.8}
              disabled={ui.disabled}
            >
              <Box
                className={`${ui.color} rounded-full flex-row items-center justify-center border border-white/20 ${ui.showLabel ? 'px-5 py-2.5' : 'p-3' // Use equal padding for a circular icon-only look
                  }`}
              >
                <Icon as={ui.icon} size="xs" className="text-white" />
                {/* Conditionally render the Text Label */}
                {ui.showLabel && (
                  <Text className="text-white text-[11px] font-bold uppercase tracking-[1px] ml-2">
                    {ui.text}
                  </Text>
                )}
              </Box>
            </TouchableOpacity>
          )}
          {isLiked && !cardComingFrom ?
            <Button
              onPress={handleLike}
              // Increased background opacity for better visibility without blur
              className={`h-14 w-14 mt-2 rounded-full p-0 shadow-2xl border border-white/30 bg-error-500
              }`}
            >
              <MotiView
                animate={{
                  scale: isLiked ? [1, 1.3, 1] : 1, // "Pop" effect when liked
                  backgroundColor: isLiked ? '#ef4444' : 'rgba(0,0,0,0.5)',
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 150,
                }}
                className="p-4 rounded-full shadow-2xl mb-2 border border-white/20"
                style={{ backgroundColor: isLiked ? '#ef4444' : 'rgba(0,0,0,0.5)' }}
              >
                <Icon
                  as={HeartIcon}
                  color="white"
                  fill={isLiked ? "white" : "none"}
                  size="xl"
                />
              </MotiView>

            </Button>



            : <Button
              onPress={handleLike}
              // Increased background opacity for better visibility without blur
              className={`h-14 w-14 mt-2 rounded-full p-0 shadow-2xl border border-white/30 bg-black/40
              }`}
            >
              <Icon
                as={Heart}
                size="lg"
                className='text-white'
              />
            </Button>
          }
        </HStack>
          : null}

        {/* 3. Information Scrim */}
        <LinearGradient
          // Deepened the gradient stops to compensate for the lack of blur
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.98)']}
          locations={[0, 0.3, 0.6, 1]}
          className="absolute bottom-0 left-0 right-0 h-[65%] justify-end p-7"
        >
          <VStack space="md">
            <VStack space="xs">
              <HStack className="items-center gap-2">
                <Heading className="text-white text-4xl font-black tracking-tight">
                  {profile.full_name}, {profile?.age}
                </Heading>
                {profile?.IsVerified === 1 && (
                  <Icon as={CheckCircleIcon} className="text-blue-400" size="md" />
                )}
              </HStack>

              <HStack className="items-center gap-2">
                {/* Status Dot with Glow */}
                <Box className="h-2.5 w-2.5 rounded-full bg-green-500 border border-white/20" />
                <Text className="text-white/80 text-sm font-medium">Recently Active</Text>
              </HStack>
            </VStack>

            {/* Profile Details */}
            <Text className="text-white/90 text-[16px] font-medium leading-6">
              {formatHeight(profile?.height)}
              {formatHeight(profile?.height) && profile?.sub_community_name ? `  •  ${profile.sub_community_name}` : ''}
              {/* {profile?.religion_name ? `  •  ${profile.religion_name}` : ''} */}
              {profile?.work_with_name ? `  •  ${profile.work_with_name}` : ''}

              {/* {formatHeight(profile?.height)} {formatHeight(profile?.height) && profile?.sub_community_name && (
                <>  •  {profile?.sub_community_name}</>
              )}

              {profile?.community && profile?.work_details && (
                <>  •  {profile?.work_details}</>
              )} */}
            </Text>

            {/* Info Pills using alpha colors */}
            <HStack space="sm" className="flex-wrap gap-2">
              <Box className="bg-white/20 px-3 py-2 rounded-xl border border-white/10 flex-row items-center gap-2">
                <Icon as={MapPin} size="xs" className="text-cyan-300" />
                <Text className="text-white text-xs font-bold">{profile.city_name} , {profile?.state_name}</Text>
              </Box>



              {/* {user?.role === 'member' && (
                <Box className="bg-indigo-600/40 px-3 py-2 rounded-xl border border-indigo-400/30 flex-row items-center gap-2">
                  <Icon as={UsersIcon} size="xs" className="text-indigo-300" />
                  <Text className="text-indigo-100 text-xs font-bold">Great Match</Text>
                </Box>
              )} */}
            </HStack>
          </VStack>
        </LinearGradient>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  photoImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
});
