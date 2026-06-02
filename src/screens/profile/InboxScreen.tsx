import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { VStack } from '@/src/components/common/GluestackUI'
import HeaderSession from '../common/HeaderSession'

const PaymentScreen = ({ navigation }: any) => {
    return (

        <VStack className="flex-1 bg-white">
            {/* 1. Global Status Settings (Top Level) */}
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Payment Detials"
                theme='emerald'
                //subTitle="System Overview"
                showRightIcon={false}
                leftIconType="menu"
                onLeftPress={() => navigation.openDrawer()}
            />
            <Text>InboxScreen</Text>
        </VStack>
    )
}

export default PaymentScreen