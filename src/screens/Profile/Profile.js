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
import { all } from 'axios';


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
    {
      id: 3,
      iconeLeft: imagePath.compliant,
      label: 'Create Request',
      next: imagePath.next,
    },
    {
      id: 4,
      iconeLeft: imagePath.quote_request,
      label: 'Privacy Policy',
      next: imagePath.next,
    },
    {
      id: 5,
      iconeLeft: imagePath.settings,
      label: 'Settings',
      next: imagePath.next,
    },
    {id: 6, iconeLeft: imagePath.out, label: 'Log out', next: imagePath.next},
  ];

  const [profileImage,setProfileImage] = useState()

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
        console.log(parsedData, "==== Parsed userData ====");
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
      setProfileImage(image)
      console.log(image,'image');
    }).catch((error)=>{
      console.log(error,'erro');
      
    })
  };

  return (
    <SafeAreaView style={styles.mianConatainer}>
      <View
        style={{
          ...styles.mianConatainer,
          paddingHorizontal: moderateScale(20),
        }}>
        <TouchableOpacity onPress={() => Alert.alert('Wokring')}>
          <Image
            source={imagePath.arrow_back}
            style={styles.imageArrowBackStye}
          /> 
        </TouchableOpacity>
        <Text style={styles.profileText}>{'Profile'}</Text>
        <View style={{alignItems: 'center', marginTop: verticalScale(20)}}>
          <View style={styles.ProfileView}>
            <View style={styles.ProfileViewTwo}>
              <View style={styles.profileViewStyle}>
                <Image
                  style={styles.profileImage}
                  // source={imagePath.profile_image}
                  source={profileImage?.sourceURL ?  {uri:profileImage?.sourceURL
                  } : imagePath.profile_image}
                />
                <TouchableOpacity
                  onPress={() => ImageImportFromGallery()}
                  style={styles.editImageButton}>
                  <Image
                    style={styles.editImageStyle}
                    source={imagePath.edit}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
         <View>
  <Text style={styles.userNameText}>{userData.name}</Text> {/* Fixed */}
  <Text style={styles.userNumberText}>{userData.phone}</Text>
  <Text style={styles.userNumberText}>{userData.email}</Text> {/* Fixed */}
</View>

          <FlatList
            data={Data}
            contentContainerStyle={{
              marginTop: moderateScale(40),
              paddingBottom: moderateScale(20),
            }}
            ItemSeparatorComponent={() => (
              <View style={{height: verticalScale(20)}} />
            )}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => {
              const handleItemPress = async () => {
                if (item.label === 'Log out') {
                  await AsyncStorage.removeItem('userData'); // or use clear() to remove everything
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
                  });
                } else if (item.label === 'Order History') {
                  navigation.navigate('OrderHistory');
                } else {
                  Alert.alert(item.label); // for now, just alert others
                }
              };
            
              return (
                <TouchableOpacity onPress={handleItemPress} style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View
                    style={{
                      width: '20%',
                      borderRadius: 100,
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: moderateScale(32),
                      width: moderateScale(32),
                      backgroundColor: colors.backgorundColor,
                    }}>
                    <Image
                      style={{
                        height: moderateScale(16),
                        width: moderateScale(16),
                      }}
                      source={item.iconeLeft}
                    />
                  </View>
                  <View style={{width: '55%', marginHorizontal: moderateScale(20)}}>
                    <Text>{item.label}</Text>
                  </View>
                  <View style={{width: '20%'}}>
                    <Image
                      style={{
                        width: moderateScale(12),
                        height: moderateScale(12),
                      }}
                      source={item.next}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
            
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mianConatainer: {
    flex: 1,
  },
  imageArrowBackStye: {
    width: moderateScale(12),
    height: verticalScale(12),
  },
  profileText: {
    fontSize: scale(16),
    textAlign: 'center',
    marginTop: verticalScale(12),
  },
  ProfileView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(150),
    width: moderateScale(150),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.roudnCOlor,
  },
  ProfileViewTwo: {
    height: moderateScale(130),
    width: moderateScale(130),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.roudnCOlor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    height: moderateScale(80),
    width: moderateScale(80),
    borderRadius:100,
  },
  profileViewStyle: {
    backgroundColor: colors.backgorundColor,
    height: moderateScale(100),
    width: moderateScale(100),
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: moderateScale(6),
    right: moderateScale(4),
  },
  editImageStyle: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  userNameText: {
    fontSize: scale(14),
    color: colors.black,
    textAlign: 'center',
    marginTop: moderateScale(16),
  },
  userNumberText: {
    fontSize: scale(14),
    color: colors.black,
    textAlign: 'center',
    marginTop: moderateScale(4),
  },
});
