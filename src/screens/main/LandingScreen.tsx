// Updated Imports
import { ScrollView } from '@/components/ui/scroll-view';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Button, ButtonText } from '@/components/ui/button';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { useAuth } from '../../context/AuthContext';

export default function LandingScreen({ navigation }:any) {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Staff', value: '24', color: '$primary' },
    { label: 'Active Today', value: '18', color: '$success' },
    { label: 'On Leave', value: '3', color: '$warning' },
    { label: 'Tasks', value: '12', color: '$info' },
  ];
const quickActions = [
  { label: 'Add Staff', route: 'Staff' }, // Works: 'Staff' is in the Drawer
  { label: 'My Interests', route: 'Interests' }, // Works: 'Interests' is a Tab
  { label: 'Profile Access', route: 'ProfileAccess' }, // Works: 'ProfileAccess' is a Tab
];
  // const quickActions = [
  //   { label: 'Add Staff', route: 'Staff', icon: 'user-plus' },
  //   { label: 'Schedule', route: 'Schedule', icon: 'calendar' },
  //   { label: 'Reports', route: 'Reports', icon: 'file-text' },
  //   { label: 'Messages', route: 'Messages', icon: 'message-circle' },
  // ];

  return (
    <ScrollView className="flex-1 bg-background-0">
      <Box className="px-4 py-6">
        
        {/* Welcome Section */}
        <VStack className="gap-1 mb-6">
          <Text className="text-lg text-typography-500">
            Welcome back,
          </Text>
          <Heading size="2xl" className="text-typography-900">
            {user?.name || 'User'}
          </Heading>
        </VStack>

        {/* Stats Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <HStack className="gap-4">
            {stats.map((stat: any, index: number) => (
              <Card 
                key={index} 
                variant="elevated" 
                className="p-4 min-w-[160px] items-center justify-center"
              >
                <VStack className="gap-1 items-center">
                  {/* Dynamic colors can be passed via style or custom classes */}
                  <Text className={`text-4xl font-bold ${stat.textColorClass || 'text-primary-500'}`}>
                    {stat.value}
                  </Text>
                  <Text className="text-sm text-typography-500 text-center">
                    {stat.label}
                  </Text>
                </VStack>
              </Card>
            ))}
          </HStack>
        </ScrollView>

        <Divider className="my-4" />

        {/* Quick Actions */}
        <VStack className="gap-4">
          <Heading size="lg">Quick Actions</Heading>
          <Box className="flex-row flex-wrap justify-between">
            {quickActions.map((action: any, index: number) => (
              <Box key={index} className="w-[48%] mb-4">
                <Button
                  variant="outline"
                  size="lg"
                  onPress={() => navigation.navigate(action.route)}
                  className="w-full"
                >
                  <ButtonText>{action.label}</ButtonText>
                </Button>
              </Box>
            ))}
          </Box>
        </VStack>

        <Divider className="my-4" />

        {/* Recent Activity */}
        <VStack className="gap-4">
          <Heading size="lg">Recent Activity</Heading>
          {[1, 2, 3].map((item) => (
            <Card key={item} variant="elevated" className="mb-2 p-4">
              <HStack className="gap-3 items-center">
                <Avatar size="sm" className="bg-amber-600">
                  <AvatarFallbackText className="text-white">JD</AvatarFallbackText>
                </Avatar>
                <VStack className="flex-1">
                  <Text className="font-semibold text-typography-900">John Doe checked in</Text>
                  <Text className="text-sm text-typography-500">
                    10:30 AM • Today
                  </Text>
                </VStack>
                <Box className="px-2 py-1 bg-success-100 rounded-full">
                  <Text className="text-xs text-success-700 font-medium">
                    On Time
                  </Text>
                </Box>
              </HStack>
            </Card>
          ))}
        </VStack>
      </Box>
    </ScrollView>
  );
}