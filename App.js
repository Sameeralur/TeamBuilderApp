import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  Switch,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import userdata from './userdata.json';

const PAGE_SIZE = 10; // Number of users per page

// HomeScreen component
const HomeScreen = ({ navigation }) => {
  // States for various filters and search text
  const [searchText, setSearchText] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState(false);

  // Function to apply filters
  const applyFilters = () => {
    // Filter the user data based on applied filters
    const filteredData = userdata.filter((user) => {
      return (
        (!searchText || (user.first_name + ' ' + user.last_name).includes(searchText)) &&
        (domainFilter === '' || user.domain === domainFilter) &&
        (genderFilter === '' || user.gender === genderFilter) &&
        (!availabilityFilter || user.available)
      );
    });

    // Navigate to the UserList screen with the filtered data
    navigation.navigate('UserList', {
      filteredData: filteredData,
    });
  };

  return (
    <ImageBackground
      source={require('./1.jpg')} // Replace with your background image path
      style={styles.backgroundImage}
    >
      <View style={styles.centeredContainer}>
        {/* Welcome message */}
        <Text style={styles.welcomeText}>Welcome to Team Formation App</Text>

        {/* Input fields and filters */}
        <TextInput
          style={styles.input}
          placeholder="Search by Name"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by Domain"
          value={domainFilter}
          onChangeText={(text) => setDomainFilter(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by Gender"
          value={genderFilter}
          onChangeText={(text) => setGenderFilter(text)}
        />
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Available Only</Text>
          <Switch
            value={availabilityFilter}
            onValueChange={() => setAvailabilityFilter(!availabilityFilter)}
          />
        </View>

        {/* Apply Filters button */}
        <Button title="Apply Filters" onPress={applyFilters} />
      </View>
    </ImageBackground>
  );
};

// UserListScreen component
const UserListScreen = ({ navigation }) => {
  const filteredData = navigation.getParam('filteredData', []);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  // Function to handle user selection
  const handleUserSelection = (userId) => {
    const updatedUsers = selectedUsers.slice();
    const userIndex = updatedUsers.findIndex((user) => user.id === userId);

    if (userIndex !== -1) {
      // If the user is already selected, remove them
      updatedUsers.splice(userIndex, 1);
    } else {
      // If the user is not selected, add them
      const userToAdd = userdata.find((user) => user.id === userId);
      if (userToAdd) {
        updatedUsers.push(userToAdd);
      }
    }

    setSelectedUsers(updatedUsers);
  };

  // Function to add selected users to the team
  const addToTeam = () => {
    // Create an array of unique domains from selected users
    const uniqueDomains = {};
    selectedUsers.forEach((user) => {
      uniqueDomains[user.domain] = true;
    });

    // Pass the selectedUsers array to TeamDetails
    const teamDetails = selectedUsers;
    navigation.navigate('TeamDetails', { teamDetails });
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    setData(paginatedData);
  }, [currentPage, filteredData]);

  return (
    <ImageBackground
      source={require('./1.jpg')} // Replace with your background image path
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Add To Team button */}
        <View style={styles.addButtonContainer}>
          <Button
            title="Add To Team"
            onPress={addToTeam}
            disabled={selectedUsers.length === 0} // Disable the button if no users are selected
          />
        </View>

        {/* User List */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                style={styles.avatar}
                source={{ uri: item.avatar }}
              />
              <Text>ID: {item.id}</Text>
              <Text>First Name: {item.first_name}</Text>
              <Text>Last Name: {item.last_name}</Text>
              <Text>Email: {item.email}</Text>
              <Text>Gender: {item.gender}</Text>
              <Text>Domain: {item.domain}</Text>
              <Text>Availability: {item.available ? 'Available' : 'Not Available'}</Text>
              <Button
                title={selectedUsers.some((user) => user.id === item.id) ? 'Selected' : 'Select'}
                onPress={() => handleUserSelection(item.id)}
              />
            </View>
          )}
        />

        {/* Pagination and Total Pages */}
        <View style={styles.pagination}>
          <Button
            title="Previous Page"
            onPress={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
          />
          <Text>{`Page ${currentPage} of ${totalPages}`}</Text>
          <Button
            title="Next Page"
            onPress={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

// TeamDetailsScreen component
const TeamDetailsScreen = ({ navigation }) => {
  const teamDetails = navigation.getParam('teamDetails', []);

  return (
    <ImageBackground
      source={require('./1.jpg')} // Replace with your background image path
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text>Team Details</Text>
        {/* Display details of selected users */}
        {teamDetails.map((user, index) => (
          <View key={index} style={styles.card}>
            <Image
              style={styles.avatar}
              source={{ uri: user.avatar }}
            />
            <Text>ID: {user.id}</Text>
            <Text>First Name: {user.first_name}</Text>
            <Text>Last Name: {user.last_name}</Text>
            <Text>Email: {user.email}</Text>
            <Text>Gender: {user.gender}</Text>
            <Text>Domain: {user.domain}</Text>
            <Text>Availability: {user.available ? 'Available' : 'Not Available'}</Text>
          </View>
        ))}
      </View>
    </ImageBackground>
  );
};

// Stack navigator
const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    UserList: UserListScreen,
    TeamDetails: TeamDetailsScreen,
  },
  {
    initialRouteName: 'Home',
  }
);

// App container
const AppContainer = createAppContainer(AppNavigator);

// Main App component
export default function App() {
  return <AppContainer />;
}

// Styles
const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'green',
    fontSize: 25,
    marginBottom: 50,
  },
  input: {
    fontSize: 15,
    height: 40,
    width: '85%',
    borderColor: 'black',
    borderWidth: 2,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 50,
    paddingVertical: 50,
  },
  card: {
    borderWidth: 1.5,
    borderColor: 'red',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  label: {
    fontSize: 20,
    marginRight: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
});
