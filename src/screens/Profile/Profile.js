import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import imagePath from '../../constants/imagePath';
import {moderateScale, scale, verticalScale} from '../../styles/scaling';
import colors from '../../styles/colors';
import ImagePicker from 'react-native-image-crop-picker';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({navigation}) => {
  const Data = [
    {
      id: 1,
      iconeLeft: imagePath.history,
      label: 'Order History',
      next: imagePath.next,
    },
    {
      id: 2,
      iconeLeft: imagePath.location,
      label: 'Shipping Address',
      next: imagePath.next,
    },
    {id: 6, iconeLeft: imagePath.out, label: 'Log out', next: imagePath.next},
  ];

  const [profileImage, setProfileImage] = useState();
  const [userData, setUserData] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData({
            name: parsedData.userName || parsedData.name || '',
            phone: parsedData.phone || '',
            email: parsedData.email || parsedData.user || '',
          });

          if (parsedData.photo) {
            setProfileImage({ uri: parsedData.photo });
          }
        }
      } catch (error) {
        console.log('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const ImageImportFromGallery = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      setProfileImage(image);
    }).catch(error => {
      console.log(error, 'error');
    });
  };

  return (
    <SafeAreaView style={styles.mianConatainer}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={imagePath.arrow_back} style={styles.imageArrowBackStye} />
        </TouchableOpacity>

        <Text style={styles.profileText}>My Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image
              style={styles.profileImage}
              source={
                profileImage?.path
                  ? { uri: profileImage.path }
                  : profileImage?.uri
                  ? { uri: profileImage.uri }
                  : imagePath.profile_image
              }
            />
            <TouchableOpacity
              onPress={ImageImportFromGallery}
              style={styles.editImageButton}>
              <Image
                style={styles.editImageStyle}
                source={imagePath.edit}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.userNameText}>{userData.name}</Text>
          <Text style={styles.userInfoText}>{userData.phone}</Text>
          <Text style={styles.userInfoText}>{userData.email}</Text>
        </View>

        <FlatList
          data={Data}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: verticalScale(16) }} />}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const handleItemPress = async () => {
              if (item.label === 'Log out') {
                await AsyncStorage.removeItem('userData');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else if (item.label === 'Order History') {
                navigation.navigate('OrderHistory');
              } else if (item.label === 'Shipping Address') {
                navigation.navigate('ShippingAddress');
              } else {
                Alert.alert(item.label);
              }
            };

            return (
              <TouchableOpacity onPress={handleItemPress} style={styles.listItem}>
                <View style={styles.iconWrapper}>
                  <Image style={styles.iconImage} source={item.iconeLeft} />
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Image style={styles.arrowIcon} source={item.next} />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Profile;


const styles = StyleSheet.create({
  mianConatainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  backButton: {
    marginTop: verticalScale(12),
    width: 30,
  },
  imageArrowBackStye: {
    width: moderateScale(16),
    height: verticalScale(16),
  },
  profileText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: verticalScale(12),
    color: colors.black,
  },
  profileCard: {
    alignItems: 'center',
    marginTop: verticalScale(24),
    padding: moderateScale(20),
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: verticalScale(12),
  },
  profileImage: {
    height: moderateScale(100),
    width: moderateScale(100),
    borderRadius: 100,
    backgroundColor: '#ddd',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
  },
  editImageStyle: {
    width: moderateScale(16),
    height: moderateScale(16),
  },
  userNameText: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.black,
  },
  userInfoText: {
    fontSize: scale(14),
    color: '#555',
    marginTop: 2,
  },
  listContainer: {
    marginTop: verticalScale(30),
    paddingBottom: verticalScale(40),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: moderateScale(14),
    borderRadius: 12,
    elevation: 2,
  },
  iconWrapper: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: 16,
    backgroundColor: colors.backgorundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    height: moderateScale(16),
    width: moderateScale(16),
  },
  itemLabel: {
    flex: 1,
    marginHorizontal: moderateScale(16),
    fontSize: scale(14),
    color: '#333',
  },
  arrowIcon: {
    width: moderateScale(12),
    height: moderateScale(12),
  },
});

