import React, { memo } from 'react';
import { FlatList, Pressable } from 'react-native';
import { Box, HStack, VStack, Heading, Text, } from '@/src/components/common/GluestackUI';
import MatchCard from './MatchCard';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';

// Memoized to prevent re-rendering when parent vertical list scrolls
const SectionHorizontalList = memo(({ title, data, isPremium, onSeeAll }: any) => {
    return (
        <VStack className="py-4">
            {/* Section Header */}
            <HStack className="px-4 justify-between items-center mb-4">
                <Heading size="md" className="text-typography-900">
                    {title}
                </Heading>
                <Pressable onPress={onSeeAll} className="flex-row items-center">
                    <Text size="sm" className="text-cyan-600 font-medium">See All</Text>
                    <Icon as={ChevronRightIcon} size="xs" className="text-cyan-600 ml-1" />
                </Pressable>
            </HStack>

            {/* Horizontal List */}
            <FlatList
                horizontal
                data={data}
                renderItem={({ item }) => <MatchCard item={item} isPremium={isPremium} />}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                // Performance Props for Horizontal Lists
                snapToInterval={200} // Width of card + margin for a snappy feel
                decelerationRate="fast"
                initialNumToRender={3}
                windowSize={3}
                removeClippedSubviews={true}
            />
        </VStack>
    );
});

export default SectionHorizontalList;
