import   { useState } from 'react';
 
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { User } from '@/src/utils/models';

import { ScrollView } from '@/components/ui/scroll-view';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { 
  FormControl, 
  FormControlLabel, 
  FormControlLabelText 
} from '@/components/ui/form-control';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Pressable } from '@/components/ui/pressable';

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  } as User);

  const handleUpdate = async () => {
    try {
      await updateUser({ ...user, ...formData });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: formData.name, key: 'name' },
        { label: 'Email', value: formData.email, key: 'email' },
        { label: 'Phone', value: formData.phone || 'Not set', key: 'phone' },
        { label: 'Employee ID', value: user?.employeeId || 'N/A' },
      ],
    },
    {
      title: 'Work Information',
      items: [
        { label: 'Department', value: formData.department || 'Not set', key: 'department' },
        { label: 'Position', value: user?.position || 'N/A' },
        { label: 'Join Date', value: user?.joinDate || 'N/A' },
        { label: 'Status', value: user?.status || 'Active' },
      ],
    },
  ];

 return (
    <ScrollView className="flex-1 bg-background-0">
      <Box className="px-4 py-6">
        {/* Profile Header */}
        <VStack className="items-center mb-8 gap-4">
          <Avatar size="2xl" className="bg-amber-600">
            <AvatarFallbackText className="text-white">
              {formData.name?.charAt(0) || 'U'}
            </AvatarFallbackText>
          </Avatar>
          
          <VStack className="items-center gap-1">
            <Heading size="xl" className="text-typography-900">
              {formData.name}
            </Heading>
            <Text className="text-typography-500">
              {formData.department || 'No department'}
            </Text>
          </VStack>

          <Button
            variant={isEditing ? 'solid' : 'outline'}
            onPress={() => setIsEditing(!isEditing)}
            className="mt-2"
          >
            <ButtonText>
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </ButtonText>
          </Button>
        </VStack>

        {isEditing ? (
          /* Edit Form */
          <VStack className="gap-6">
            {Object.entries(formData).map(([key, value]: [string, any]) => (
              <FormControl key={key}>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    value={value}
                    onChangeText={(text: string) =>
                      setFormData({ ...formData, [key]: text })
                    }
                  />
                </Input>
              </FormControl>
            ))}
            <Button onPress={handleUpdate} className="mt-4">
              <ButtonText>Save Changes</ButtonText>
            </Button>
          </VStack>
        ) : (
          /* View Profile */
          <VStack className="gap-6">
            {profileSections.map((section: any, index: number) => (
              <Card key={index} variant="elevated" className="p-4">
                <Heading size="md" className="mb-4">
                  {section.title}
                </Heading>
                <VStack className="gap-0">
                  {section.items.map((item: any, itemIndex: number) => (
                    <Box key={itemIndex}>
                      <HStack className="justify-between py-3">
                        <Text className="text-typography-500">{item.label}</Text>
                        <Text className="font-semibold text-typography-900">
                          {item.value}
                        </Text>
                      </HStack>
                      {itemIndex < section.items.length - 1 && <Divider />}
                    </Box>
                  ))}
                </VStack>
              </Card>
            ))}

            {/* Additional Actions */}
            <VStack className="gap-3 mt-4">
              <Pressable
                onPress={() => Alert.alert('Change Password', 'Feature coming soon!')}
                className="py-3 px-4 bg-background-0 rounded-md border border-outline-200 active:bg-background-50"
              >
                <Text className="text-center font-medium">
                  Change Password
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => Alert.alert('Notification Settings', 'Feature coming soon!')}
                className="py-3 px-4 bg-background-0 rounded-md border border-outline-200 active:bg-background-50"
              >
                <Text className="text-center font-medium">
                  Notification Settings
                </Text>
              </Pressable>
            </VStack>
          </VStack>
        )}
      </Box>
    </ScrollView>
  );
}