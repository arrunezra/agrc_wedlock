 
import { useTheme,Button, ButtonText,Box,HStack } from '@/src/components/common/GluestackUI';
 
export const ThemeSettings = () => {
  const { mode, flavor, toggleMode, setFlavor } = useTheme();

  return (
    <Box className="p-4 gap-6 bg-background-0">
      {/* Mode Toggle */}
      <Button onPress={toggleMode} className="bg-primary-500">
        <ButtonText>Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode</ButtonText>
      </Button>

      {/* Flavor Toggles */}
      <HStack className="gap-2">
        <Button 
          action={flavor === 'blue' ? 'primary' : 'secondary'}
          onPress={() => setFlavor('blue')}
          className="flex-1"
        >
          <ButtonText>Blue Theme</ButtonText>
        </Button>

        <Button 
          action={flavor === 'green' ? 'primary' : 'secondary'}
          onPress={() => setFlavor('green')}
          className="flex-1"
        >
          <ButtonText>Green Theme</ButtonText>
        </Button>
      </HStack>
    </Box>
  );
};