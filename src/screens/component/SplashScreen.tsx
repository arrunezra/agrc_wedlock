import FastImage from '@d11/react-native-fast-image';
import React from 'react';
import { View, Image, StyleSheet, Dimensions, ImageBackground, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ImageBackground
                source={require('../../assets/images/bgimage.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.darkOverlay} />

                <View style={styles.logoContainer}>
                    <FastImage
                        source={require('../../assets/logo/splace_screen.jpg')}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode={FastImage.resizeMode.contain}
                    />


                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#041512',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(4, 21, 18, 0.15)',
    },
    logoContainer: {
        width: width * 0.85,
        height: height * 0.80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    centerSpinnerContainer: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        top: 60,
    },
});

export default SplashScreen;