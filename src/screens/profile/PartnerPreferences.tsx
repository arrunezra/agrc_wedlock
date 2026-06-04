import { Box, ScrollView } from "@/src/components/GluestackUI";
import { useContext, useEffect, useState } from "react";
import EditPreferenceModal from "./home_sub_screen/EditPreferenceModal";
import PartnerPreferencesView from "./PartnerPreferencesView";
import { LookupContext } from "@/src/context/LookupContext";
import profileService from "@/src/services/profileService";
import { useAppToast } from "@/src/context/ToastContext";
import { useAuth } from "@/src/context/AuthContext";
import { compact } from "lodash";
import { RefreshControl, StatusBar } from "react-native";
import HeaderSession from "@/src/components/HeaderSession";

const PartnerPreferences = ({ navigation }: any) => {
    const { user } = useAuth();
    const profile_id = user?.profile_id;
    //console.log('profile_id', profile_id);
    const { lookups } = useContext(LookupContext);
    const { showToast } = useAppToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);

    const [preferences, setPreferences] = useState({
        min_age: 27,
        max_age: 36,
        min_height: '150',
        max_height: '190',
        religions: [], // Array for MultiSelect
        communities: [],
        mother_tongues: [],
        marital_status: [],
        children: '',
        qualifications: [],
        min_income: '',
        max_income: '',
        education: [],
        working_with: [],
        country: '',
        state: '',
        city: ''
    });
    useEffect(() => {
        fetchData();
    }, [])
    const fetchData = async () => {
        try {
            const response = await profileService.getPartnerPreferences(profile_id)
            console.log("respomse", response)
            if (response.success) {
                setPreferences(response?.data)
                console.log('Section updated successfully:', activeSection);
            } else {
                console.error('Update failed:', response.message);
            }
        } catch (error) {
            //showToast("Partner Preferences", "Server Error ", "error");
            console.error('Network error:', error);
        }
    }
    const handleEditPress = (fieldKey: string, action: string) => {
        setActiveSection(action);
        setActiveField(fieldKey);
        setIsModalOpen(true);
    };

    const handleSaveUpdate = async (newValue: any) => {
        console.log('newValue', newValue)
        // 1. Update local state first so the UI reflects the change immediately
        const updatedPreferences = newValue;
        setPreferences(updatedPreferences);

        // 2. Prepare the payload based on the active section
        let payload: any = { profile_id: profile_id };

        if (activeSection === 'basic_details') {
            payload = {
                ...payload,
                min_age: updatedPreferences.min_age,
                max_age: updatedPreferences.max_age,
                min_height: updatedPreferences.min_height,
                max_height: updatedPreferences.max_height,
                marital_status: updatedPreferences.marital_status,
                children: updatedPreferences.children
            };
        } else if (activeSection === 'community') {
            payload = {
                ...payload,
                communities: updatedPreferences.communities,
                mother_tongues: updatedPreferences.mother_tongues,
                religions: updatedPreferences.religions
            };
        } else if (activeSection === 'education_career') {
            payload = {
                ...payload,
                qualifications: updatedPreferences.qualifications,
                min_income: updatedPreferences.min_income,
                max_income: updatedPreferences.max_income,
                working_with: updatedPreferences.working_with
            };
        } else if (activeSection === 'location') {
            payload = {
                ...payload,
                country: updatedPreferences.country,
                state: updatedPreferences.state,
                city: updatedPreferences.city
            };
        }

        // 3. Make the API call
        try {
            console.log('payload', payload)
            const response = await profileService.PartnerPreferences(payload)
            console.log("respomse", response)
            if (response.success) {
                console.log('Section updated successfully:', activeSection);
                showToast("Partner Preferences", activeSection + " updated successfully", "success");
                fetchData();
                // Optional: Show a Toast/Alert success message
            } else {
                console.error('Update failed:', response.message);
                showToast("Partner Preferences", "Update failed " + response.message, "error");

            }
        } catch (error) {
            showToast("Partner Preferences", "Server Error ", "error");
            console.error('Network error:', error);
        }

        setIsModalOpen(false);
    };

    return (
        <Box className='flex-1'>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Partner Preferences"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />
            <ScrollView className="bg-slate-50 flex-1 bg-white" refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#6366f1" />
            }>

                <PartnerPreferencesView
                    data={preferences}
                    onEditField={handleEditPress}
                />

                {isModalOpen && <EditPreferenceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fieldType={activeField}
                    currentData={preferences}
                    onSave={handleSaveUpdate}
                    lookups={lookups}
                />
                }
            </ScrollView>
        </Box>
    );
};

export default PartnerPreferences;