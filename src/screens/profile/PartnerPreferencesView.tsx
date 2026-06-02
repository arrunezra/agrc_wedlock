import React, { useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import {
    VStack, HStack, Text, Box, Heading, Center
} from '@/src/components/common/GluestackUI';
import {
    Calendar, Ruler, Users, Baby,
    Book, Globe, MapPin,
    ChevronRightIcon,
    User2Icon,
    GraduationCap,
    Briefcase,
    Banknote,
    LocateIcon
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

const PreferenceRow = ({ icon: IconComponent, label, value, color, onPress }: any) => {
    let localText: any = null;

    if (Array.isArray(value)) {
        // If it's already an array (e.g. ['Single', 'Divorced'])
        localText = value.length > 0 ? value : null;
    } else if (typeof value === 'string' && value.includes(',')) {
        // If it's a comma-separated string, split it into an array
        localText = value.split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item !== '');

    } else {
        // If it's a single string (like "27 to 35") or a number, keep it as is
        localText = value == "all" ? 'Open to All' : value;
    }
    const getBadgeColors = () => {
        if (color.includes('green')) return 'bg-green-50 border-green-800 text-green-700';
        if (color.includes('orange')) return 'bg-orange-50 border-orange-800 text-orange-700';
        if (color.includes('purple')) return 'bg-purple-50 border-purple-800 text-purple-700';
        if (color.includes('cyan')) return 'bg-cyan-50 border-cyan-800 text-cyan-700';
        return 'bg-slate-50 border-slate-100 text-slate-700';
    };
    const badgeStyle = getBadgeColors();
    return (
        <TouchableOpacity onPress={onPress}>
            <HStack className="px-4 py-4 items-center justify-between border-b border-slate-50 last:border-b-0">
                <HStack space="md" className="items-center flex-1">
                    {/* Icon Box */}
                    <Box className={`w-10 h-10 rounded-full items-center justify-center ${color}`}>
                        <Icon as={IconComponent} size="sm" className="text-white" />
                    </Box>

                    <VStack className="flex-1">
                        <Text size="xs" className="text-typography-500">{label}</Text>

                        <Box className="flex-row flex-wrap gap-1.5 mt-1">
                            {Array.isArray(localText) ? (
                                // Render Badges for Arrays
                                localText.map((item, index) => (
                                    <Box key={index} className={`px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                                        <Text size="xs" className={`font-bold ${badgeStyle.split(' ').pop()}`}>
                                            {(item == "all" ? 'Open to All' : item) ?? "Open to All"}
                                        </Text>
                                    </Box>
                                ))
                            ) : (
                                // Render Normal Text for Strings
                                <Text size="md" className="font-semibold text-typography-900">
                                    {localText || "Open to All"}
                                </Text>
                            )}
                        </Box>
                    </VStack>
                </HStack>
                <Icon as={ChevronRightIcon} className="text-slate-300" size="sm" />
            </HStack>
        </TouchableOpacity>
    );
};
const SectionHeader = ({ title }: { title: string }) => (
    <Box className="px-4 pt-6 pb-2">
        <Heading size="md" className="text-slate-900">{title}</Heading>
    </Box>
);

const PartnerPreferencesView = ({ data, onEditField }: any) => {
    console.log('PartnerPreferencesView dat====', data);

    return (

        <VStack space="sm" className="pb-10">

            {/* Header */}
            <Center className="py-8 px-6">
                <Heading size="lg" className="text-center">Your Partner Preferences</Heading>
                <Text size="sm" className="text-center text-slate-500 mt-2 px-4">
                    You will see Matches based on the Preferences you have set
                </Text>
                <Text size="xs" className="italic text-slate-400 mt-6">
                    Tap on the field to edit
                </Text>
            </Center>

            {/* --- BASIC DETAILS --- */}
            <Box className="mx-4 bg-white rounded-3xl shadow-sm overflow-hidden">
                <SectionHeader title="Basic Details" />
                <PreferenceRow
                    icon={Calendar} color="bg-green-500"
                    label="Age Range" value={`${data.min_age} to ${data.max_age}`}
                    onPress={() => onEditField('age', 'basic_details')}
                />
                <PreferenceRow
                    icon={Ruler} color="bg-green-500"
                    label="Height Range" value={`${data.min_height} to ${data.max_height}`}
                    onPress={() => onEditField('height', 'basic_details')}
                />
                <PreferenceRow
                    icon={Users} color="bg-green-500"
                    label="Marital Status" value={data.marital_statusName}
                    onPress={() => onEditField('marital', 'basic_details')}
                />
                <PreferenceRow
                    icon={Baby} color="bg-green-500"
                    label="Profile with Children" value={data.childrenDetails}
                    onPress={() => onEditField('children', 'basic_details')}
                />
            </Box>

            {/* --- COMMUNITY --- */}
            <Box className="mx-4 mt-4 bg-white rounded-3xl shadow-sm overflow-hidden">
                <SectionHeader title="Community" />
                {/* <PreferenceRow
                        icon={Book} color="bg-orange-500"
                        label="Religion" value={data.religions}
                        onPress={() => onEditField('religion')}
                    /> */}
                <PreferenceRow
                    icon={User2Icon} color="bg-orange-500"
                    label="Community" value={data.communitiesName}
                    onPress={() => onEditField('community', 'community')}
                />
                <PreferenceRow
                    icon={Globe} color="bg-orange-500"
                    label="Mother Tongue" value={data.mother_tonguesName}
                    onPress={() => onEditField('mother_tongues', 'community')}
                />
            </Box>

            {/* --- Education & Carrer --- */}
            <Box className="mx-4 mt-4 bg-white rounded-3xl shadow-sm overflow-hidden">
                <SectionHeader title="Education & Carrer" />
                <PreferenceRow
                    icon={GraduationCap}
                    color="bg-cyan-600"
                    label="Qualification"
                    value={(data?.qualifications == 'all' ? 'Open to All' : data.qualifications) || "Open to All"}
                    onPress={() => onEditField('qualification', 'education_carrer')}
                />
                {/* <PreferenceRow
                        icon={Briefcase}
                        color="bg-cyan-600"
                        label="Working with"
                        value={data.working_with || "Open to All"}
                        onPress={() => onEditField('working_with')}
                    /> */}
                <PreferenceRow
                    icon={Banknote}
                    color="bg-cyan-600"
                    label="Annual Income"
                    // value={data.income || "Open to All"}
                    value={(data?.income == 'all' ? 'Open to All' : data.income) || "Open to All"}

                    onPress={() => onEditField('income', "education_carrer")}
                />
            </Box>
            {/* --- LOCATION --- */}
            <Box className="mx-4 mt-4 bg-white rounded-3xl shadow-sm overflow-hidden">
                <SectionHeader title="Location" />
                <PreferenceRow
                    icon={Globe} color="bg-purple-500"
                    label="Country living in"
                    // value={data.country}
                    value={(data?.country == 'all' ? 'Open to All' : data.countryName) || "Open to All"}
                    onPress={() => onEditField('country', 'location')}
                />
                <PreferenceRow
                    icon={MapPin} color="bg-purple-500"
                    label="State living in"
                    // value={data.state}
                    value={(data?.state == 'all' ? 'Open to All' : data.stateName) || "Open to All"}
                    onPress={() => onEditField('state', 'location')}
                />
                <PreferenceRow
                    icon={LocateIcon} color="bg-purple-500"
                    label="State living in"
                    //value={data.state}
                    value={(data?.city == 'all' ? 'Open to All' : data.cityName) || "Open to All"}

                    onPress={() => onEditField('city', 'location')}
                />
            </Box>

        </VStack>

    );
};

export default PartnerPreferencesView;