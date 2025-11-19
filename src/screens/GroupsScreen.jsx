// screens/GroupsScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const GroupsScreen = () => {
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);

  const handleCreateGroup = () => {
    if (!groupName) return;

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      members: [],
    };

    setGroups([...groups, newGroup]);
    setGroupName('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Group</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Group Name"
          value={groupName}
          onChangeText={setGroupName}
        />
        <TouchableOpacity onPress={handleCreateGroup} style={styles.createButton}>
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>My Groups</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.memberCount}>{item.members.length} members</Text>
          </View>
        )}
      />
    </View>
  );
};

export default GroupsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
  },
  createText: { color: 'white' },
  subTitle: { marginTop: 24, fontSize: 18, fontWeight: '600' },
  groupItem: {
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  groupName: { fontSize: 16, fontWeight: '500' },
  memberCount: { fontSize: 12, color: 'gray' },
});
