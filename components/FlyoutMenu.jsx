import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../store/authSlice';
import { useDispatch } from 'react-redux';
import { selectIsAdmin } from '../store/userSlice';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const FlyoutMenu = ({ visible, onClose }) => {
  const dispatch = useDispatch();

  const isAdmin = useSelector(selectIsAdmin);
  const navigation = useNavigation();

  if (!visible) return null;

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    navigation.navigate('Login');

  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay} onTouchStart={onClose} />
      <View style={styles.menu}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="person" size={24} color="#1e3d59" />
          <Text style={styles.menuText}>Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('check')}>
          <Icon name="history" size={24} color="#1e3d59" />
          <Text style={styles.menuText}>Histórico de atendimentos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="book" size={24} color="#1e3d59" />
          <Text style={styles.menuText}>Guia</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.menuItem}   onPress={() => navigation.navigate('HealthUnitList')}>
            <Icon name="book" size={24} color="#1e3d59" />
            <Text style={styles.menuText}>Unidades</Text>
          </TouchableOpacity>
        )
        }
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#1e3d59" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
   
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'white',
    width: 250,
    padding: 16,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#1e3d59',
  },
});

export default FlyoutMenu;