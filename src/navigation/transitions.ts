import { interpolate } from "react-native-reanimated";
import Transition, { type ScreenTransitionConfig } from "react-native-screen-transitions";

const DEVICE_CORNER_RADIUS = 38;

export const iosCardStackTransition: ScreenTransitionConfig = {
	gestureEnabled: true,
	gestureDirection: "horizontal",
	transitionSpec: {
		open: Transition.Specs.DefaultSpec,
		close: Transition.Specs.DefaultSpec,
	},
	screenStyleInterpolator: ({ active, current, progress }) => {
		"worklet";
		const width = current.layouts.screen.width;
		const translateX = interpolate(
			progress,
			[0, 1, 2],
			[width, 0, -width * 0.3],
			"clamp",
		);
		return {
			content: {
				borderRadius: active.settled ? 0 : DEVICE_CORNER_RADIUS,
				borderCurve: active.settled ? "continuous" : "circular",
				overflow: "hidden",
				transform: [{ translateX }],
			},
			backdrop: {
				backgroundColor: "rgba(0,0,0,1)",
				opacity: interpolate(active.progress, [0, 1], [0, 0.1], "clamp"),
			},
		};
	},
};
