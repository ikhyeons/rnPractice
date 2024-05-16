import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDoList";

export default function App() {
  const [working, setWorking] = useState(true);
  const [input, setInput] = useState("");
  const [toDoList, setToDoList] = useState<{
    [key: string]: { text: string; work: boolean };
  }>({});

  useEffect(() => {
    loadToDoList();
  }, []);

  async function loadToDoList() {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) setToDoList(JSON.parse(s));
  }

  async function saveToDoList(toSave: {
    [key: string]: {
      text: string;
      work: boolean;
    };
  }) {
    const s = JSON.stringify(toSave);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, s);
    } catch (err) {
      console.error(err);
    }
  }
  function travel() {
    setWorking(false);
  }
  function work() {
    setWorking(true);
  }
  async function addToDo() {
    if (input === "") return;
    const newToDoList = Object.assign({}, toDoList, {
      [Date.now()]: { text: input, work: working },
    });
    setToDoList(newToDoList);
    await saveToDoList(newToDoList);
    setInput("");
  }
  async function deleteToDo(key: string) {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        onPress: async () => {
          const newToDoList = { ...toDoList };
          delete newToDoList[key];
          setToDoList(newToDoList);
          await saveToDoList(newToDoList);
        },
      },
    ]);
  }

  function onChangeText(text: string) {
    setInput(text);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          returnKeyType="done"
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
          onSubmitEditing={addToDo}
          value={input}
          onChangeText={(e) => {
            onChangeText(e);
          }}
        />
      </View>
      <ScrollView>
        {Object.keys(toDoList).map((key) =>
          toDoList[key].work === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDoList[key].text}</Text>
              <TouchableOpacity
                onPress={() => {
                  deleteToDo(key);
                }}
              >
                <Text>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
    marginVertical: 18,
  },
  toDo: {
    backgroundColor: "grey",
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: { color: "white", fontSize: 16, fontWeight: "500" },
});
