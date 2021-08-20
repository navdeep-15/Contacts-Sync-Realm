import React from 'react'
import { Text, View, StyleSheet, Platform, PermissionsAndroid, FlatList, TouchableOpacity, Image } from 'react-native'
import Contacts from 'react-native-contacts'
import Realm from "realm";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { arr: [], data: [] };
  }
  componentDidMount() {
    if (Platform.OS == 'ios') {
      Contacts.getAll((error, contact) => {
        if (error)
          throw error;
        this.setState({ arr: contact });
      })
    }
    else if (Platform.OS == 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          'title': 'Contacts',
          'message': 'This app would like to view your contacts.'
        }
      ).then(() => {
        Contacts.getAll((error, contact) => {
          if (error != 'denied')
            this.setState({ arr: contact });
        })
      })
    }
  }
  renderItems = ({ item }) => {
    return (
      <View style={styles.listitem}>
        <View style={styles.left}>
          <Image
            source={{ uri: item.c_img }}
            style={styles.imgstyle}
          />
        </View>
        <View style={styles.right}>
          <Text style={styles.name}>{item.c_name}</Text>
          <Text style={styles.email}>✉️ {item.c_email}</Text>
          <Text style={styles.number}>📞 {item.c_number}</Text>
        </View>
      </View>
    );
  }

  saveToStorage = () => {
    realm.write(() => {
      this.state.arr.map((element) => {
        realm.create("Contact", {
          c_name: element.givenName + " " + element.familyName,
          c_email: element.emailAddresses[0].email,
          c_number: element.phoneNumbers[0].number,
          c_img: element.thumbnailPath,
        });
      });
    });
    alert("Sync Sucessful");
  }
  fetchFromStorage = () => {
    this.setState({ data: realm.objects("Contact") });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}> React Native Contacts Sync </Text>
        <TouchableOpacity style={styles.btn} onPress={this.saveToStorage}>
          <Text style={styles.btntext}>Sync Contacts to Storage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={this.fetchFromStorage}>
          <Text style={styles.btntext}>Fetch Contacts from Storage</Text>
        </TouchableOpacity>
        <FlatList
          data={this.state.data}
          renderItem={this.renderItems}
          style={styles.flatliststyle}
        />
      </View>
    )
  }
}

const contactSchema = {
  name: "Contact",
  properties: {
    c_name: "string",
    c_email: "string",
    c_number: "string",
    c_img: "string",
  }
};
const realm = new Realm({ schema: [contactSchema] });

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  btn: {
    backgroundColor: 'red',
    padding: 15,
    marginTop: 20,
    borderRadius: 10
  },
  btntext: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16
  },
  flatliststyle: {
    padding: 8,
    marginTop: 20
  },
  listitem: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'red',
    paddingTop: 15,
    paddingBottom: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16
  },
  email: {
    marginTop: 5,
    fontSize: 14.5
  },
  number: {
    marginTop: 5,
    fontSize: 14.5
  },
  imgstyle: {
    width: 50,
    height: 50,
    alignSelf: 'center'
  },
  left: {
    flex: 0.25
  },
  right: {
    flex: 0.75
  }
});
