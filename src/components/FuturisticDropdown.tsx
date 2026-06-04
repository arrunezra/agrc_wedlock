import { Check } from 'lucide-react-native';
import React from 'react';
import { Dimensions, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Icon } from './IconUI';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FuturisticDropdown = ({
    data,
    value,
    onChange,
    placeholder,
    icon,
    search = false,
    isInvalid = false,
}: any) => {
    data = data || [];
    //console.log('data', data);
    let newDate = new Date();
    return (
        <Dropdown
            style={[
                {
                    height: 56,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',

                    shadowColor: '#f1f5f9',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 1,
                    shadowRadius: 2,
                    elevation: 2,

                },
                isInvalid && { borderColor: '#DC2626', borderWidth: 1.5 }
            ]}
            placeholderStyle={{ fontSize: 16, color: '#070707ff', fontWeight: '400' }}
            selectedTextStyle={{ fontSize: 16, color: '#1E293B', fontWeight: '500' }}
            inputSearchStyle={{
                height: 45,
                fontSize: 14,
                borderRadius: 12,
                backgroundColor: '#F1F5F9',
                marginHorizontal: 12,
                marginTop: 12,
                marginBottom: 12,
                paddingHorizontal: 10,
                borderColor: '#E2E8F0',
            }}
            iconStyle={{ width: 20, height: 20 }}
            containerStyle={{
                backgroundColor: 'white',
                borderRadius: 24,
                width: SCREEN_WIDTH * 0.85,
                marginHorizontal: (SCREEN_WIDTH * 0.15) / 2,
                maxHeight: '70%',
                overflow: 'hidden',
                paddingTop: 0,
            }}
            data={data || []}
            search={search}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            searchPlaceholder="Search..."
            value={value}
            onChange={(item) => {
                if (item.type !== 'HEADER') {
                    onChange(item);
                }
            }}
            mode="modal"
            backgroundColor="rgba(0,0,0,0.5)"
            flatListProps={{
                contentContainerStyle: {
                    paddingTop: 4,
                    paddingBottom: 20,
                    paddingHorizontal: 4
                },
                showsVerticalScrollIndicator: true,
                stickyHeaderIndices: data?.map((item: any, index: number) => item.type === 'HEADER' ? index : null).filter((i: any) => i !== null),
            }}
            renderLeftIcon={() => (
                <Icon as={icon?.icon} size="sm"
                    className={`mr-2 ${isInvalid ? 'text-red-600' : icon?.color ?? 'text-slate-400'}`} />
            )}
            renderItem={(item) => {
                const isHeader = item.type === 'HEADER';
                const isSelected = item.value === value;

                if (isHeader) {
                    return (
                        <View style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            backgroundColor: '#F1F5F9',
                            marginTop: 10,
                            marginBottom: 4,
                            borderRadius: 8,
                            marginHorizontal: 8,
                        }}>
                            <Text style={{
                                fontSize: 12,
                                color: '#64748B',
                                fontWeight: '800',
                                letterSpacing: 1,
                            }}>
                                {item.label.toUpperCase()}
                            </Text>
                        </View>
                    );
                }

                return (
                    <View style={{
                        padding: 16,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isSelected ? '#EEF2FF' : 'white',
                        borderRadius: 12,
                        marginHorizontal: 8,
                        marginVertical: 2,
                    }}>
                        <Text style={{
                            fontSize: 15,
                            color: isSelected ? '#4F46E5' : '#334155',
                            fontWeight: isSelected ? '600' : '400'
                        }}>
                            {item.label}
                        </Text>
                        {isSelected && <Icon as={Check} size="sm" className="text-indigo-600" />}
                    </View>
                );
            }}
        />
    );
};

export default FuturisticDropdown;