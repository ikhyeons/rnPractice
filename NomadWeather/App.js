import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import apiKey from "./apiKey";

export default function App() {
  const [city, setCity] = useState("..loading");
  const [ok, setOk] = useState(true);
  const [days, setDays] = useState([]);

  async function getPosition() {
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      {
        latitude,
        longitude,
      },
      {
        useGoogleMaps: false,
      }
    );
    setCity(location[0].city);

    return { latitude: latitude, longitude: longitude };
  }
  const ask = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    granted ? setOk(true) : setOk(true);

    const { latitude, longitude } = await getPosition();
    getWeather(latitude, longitude);
  };

  async function getWeather(lat, lon) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const json = await response.json();

    setDays(json.list);
  }
  useEffect(() => {
    ask();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
        horizontal
      >
        {days.length == 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color={"white "}
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          days
            .filter((data) => {
              return data.dt_txt.split(" ")[1] == "12:00:00";
            })
            .map((data, i) => (
              <View key={i} style={styles.day}>
                <Text style={styles.temp}>{data.main.temp}</Text>
                <Text style={styles.discription}>{data.weather[0].main}</Text>
              </View>
            ))
        )}
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "tomato" },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: { fontSize: 68, fontWeight: "500" },
  weather: {},
  day: {
    alignItems: "center",
    width: Dimensions.get("window").width,
  },
  temp: {
    marginTop: 50,
    fontSize: 138,
  },
  discription: {
    marginTop: -30,
    fontSize: 60,
  },
});
