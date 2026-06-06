import type React from "react";
import { useState } from "react";
import { View } from "react-native";
import { Splash } from "@/components/Splash";
import { useTheme } from "@/lib/theme";

type SplashFrameProps = {
	children: React.ReactNode;
	isReady: boolean;
};

export function SplashFrame({ children, isReady }: SplashFrameProps) {
	const [splashVisible, setSplashVisible] = useState(true);
	const { colors } = useTheme();

	return (
		<View style={{ flex: 1, backgroundColor: colors.canvas }}>
			{children}
			{splashVisible && (
				<Splash onDone={() => setSplashVisible(false)} isReady={isReady} />
			)}
		</View>
	);
}
