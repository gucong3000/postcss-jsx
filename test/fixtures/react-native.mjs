import React from "react";
import { AppRegistry, StyleSheet } from "react-native";

class App extends React.Component {
	render () {
		return (
			<View style={styles.box}>
				<Text style={styles.text}>Hello, world!</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	box: { padding: 10 },
	text: { fontWeight: "bold" },
});

AppRegistry.registerComponent("App", () => App);
AppRegistry.runApplication("App", { rootTag: document.getElementById("react-root") });
