import { useAuth } from '@/src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import UserTopProfile from './home_sub_screen/UserTopProfile';
import SectionHorizontalList from './home_sub_screen/SectionHorizontalList';
import { Box } from '@/src/components/common/GluestackUI';
import { FlatList, StatusBar } from 'react-native';
import { HOME_DATA } from '@/src/utils/constants';
import HeaderSession from '../common/HeaderSession';

const ProfileHomeScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const renderItem = ({ item }: any) => {
        switch (item.type) {
            case 'USER_HEADER':
                return (
                    <UserTopProfile
                        user={user}
                        onAddPhoto={() => navigation.navigate('ShowProfileGallery')}
                        onEdit={() => navigation.navigate('ProfileEdit')}
                        onPayment={(sub_amt: any) => {

                            //console.log('sub_amt', sub_amt)


                            // navigation.navigate('Checkout', {
                            //     totalAmount: sub_amt, // ₹50.00 in paise 
                            //     customerName: user?.firstName,
                            //     email: user?.email,
                            //     phoneNo: user?.phone
                            // });
                        }}
                    />
                );
            // case 'PREMIUM_MATCHES':
            // case 'NEW_MATCHES':
            //     return (
            //         <SectionHorizontalList
            //             title={item.title}
            //             data={item.data}
            //             isPremium={item.type === 'PREMIUM_MATCHES'}
            //         />
            //     );
            default:
                return null;
        }
    };

    return (
        <Box className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor="#044e3a" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="My Profile"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()}
                showLogo={false}
            />
            <FlatList
                data={HOME_DATA}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.type + index}
                showsVerticalScrollIndicator={false}
            />
        </Box>
    );
}
export default ProfileHomeScreen;