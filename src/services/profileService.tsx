import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";


export const profileService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login.php', credentials);
    return response.data;
  },
  uploadImage: async (credentials: any) => {

    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      credentials.headers.Authorization = `Bearer ${token}`;
    }
    const response = await api.post('/upload_handler.php', credentials);
    return response.data;
  },
  // sendInterest: async (credentials: any) => {
  //   const response = await api.post('/interest/send_interest.php', credentials);
  //   return response.data;
  // },
  createProfile: async (profile: any) => {
    const response = await api.post('/profile/complete_profile.php', profile)
    console.log('response', response);
    return response.data;
  },
  getCities: async (stateId: any, searchQuery: string | null = null) => {
    const url = searchQuery
      ? `/helpers/get_cities.php?statecode=${stateId}&search=${encodeURIComponent(searchQuery)}`
      : `/helpers/get_cities.php?statecode=${stateId}`;
    const response = await api.get(url);
    return response.data;
  },
  getprofile: async (credentials: any, signal: any) => {

    try {
      const response = await api.post('/profile/getprofile.php', credentials, { signal }); //For summary
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  validateMobileOrEmail: async (credentials: any) => {
    const response = await api.post('/profile/validate_mobileno.php', credentials);
    return response.data;
  },
  getDashboardData: async () => {
    try {
      const response = await api.get('/profile/get_dashboard.php');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  fetchProfileDetailsByID: async (id: any, action: string) => {
    try {
      const response = await api.get(`/profile/get_profile_details_by_id.php?id=${id}&action=${action}`); //For details with view count
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  verifyorStatusUpdate: async (id: any, status: any, aciton: string) => {
    try {
      const response = await api.get(`/profile/Verifiy_profile.php?id=${id}&status=${status}&action=${aciton}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  fetchProfileGallery: async (userid: any, profile_id: any) => {
    try {
      const response = await api.get(`/profile/get_profile_gallery.php?userid=${userid}&profile_id=${profile_id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  setDefaultOrDeleteProfileImage: async (profile_id: any, image_id: any, action: string) => {
    try {
      const response = await api.post(`/profile/set_default_or_delete_profile_image.php`, {
        action: action,
        profile_id: profile_id,
        image_id: image_id,
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  updateEditProfile: async (fields: any) => {
    try {
      const response = await api.post('/profile/update_profile_details_by_id.php', fields); //For summary
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  PartnerPreferences: async (fields: any) => {
    try {
      const response = await api.post('/profile/partner_preferences.php', fields); //For summary
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  getPartnerPreferences: async (profile_id: any) => {
    try {
      const response = await api.get(`/profile/get_partner_preferences.php?profile_id=${profile_id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  loadLookupData: async (action: string, lookupMasterID: number) => {
    try {
      const response = await api.get(`/lookups/getlookups.php?action=${action}&masterid=${lookupMasterID}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }
  },
  verifyPhotos: async (file_id: any, action: any) => {
    try {
      const response = await api.get(`/profile/verify_photos.php?action=${action}&file_id=${file_id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: "Network connection failed" };
    }

  },
  // respondToInterest: async ({ sender_id, action }: any) => {
  //   try {
  //     // action should be either 'Accepted' or 'Rejected'
  //     const response = await api.post('/interest/respond_interest.php', {
  //       sender_id,
  //       action
  //     });

  //     return response.data;
  //   } catch (error: any) {
  //     console.error(`Error during ${action} action:`, error);
  //     return error.response?.data || { success: false, message: "Server connection failed" };
  //   }
  // },
  // toggleLike: async (body: any) => {
  //   try {
  //     // action should be either 'Accepted' or 'Rejected'
  //     const response = await api.post('/interest/toggle_like.php', body);

  //     return response.data;
  //   } catch (error: any) {
  //     console.error(`Error during action:`, error);
  //     return error.response?.data || { success: false, message: "Server connection failed" };
  //   }
  // },
  getFavorites: async (type: any) => {
    try {
      const response = await api.get(`/interest/get_favorites_combined.php?type=${type}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },
  handle_member_actions: async (body: any) => {
    try {
      const response = await api.post('/profile/profile_block_report_actions.php', body);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },
  fetchBlockedUsers: async () => {
    try {
      const response = await api.get(`/profile/get_blocked_users.php`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },
  fetchSummaryDetails: async (body: any) => {
    try {
      //console.log('body', body)
      const response = await api.post(`/profile/get_profile_home_summary.php`, body);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },
  handle_interest_block_actions: async (body: any) => {
    try {
      const response = await api.post('/interest/handle_interest_block_actions.php', body);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },
  setViewLog: async (body: any) => {
    try {
      const response = await api.post('/profile/log_view.php', body);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

};

export default profileService;