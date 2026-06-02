import { Button, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAppToast } from '@/src/context/ToastContext';

const MyPhotos = () => {
    const { showToast } = useAppToast();
    return (
        <View>
            <Text>MyPhotos</Text>
            <Button
                onPress={() => showToast("Success! arun", "The new library is working.", "success")}
                title="Learn More"
                color="#841584"
                accessibilityLabel="Learn more about this purple button"
            />
        </View>
    )
}

export default MyPhotos

const styles = StyleSheet.create({})