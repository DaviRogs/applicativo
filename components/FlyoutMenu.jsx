import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAdmin } from '../store/userSlice';
import { useNavigation } from '@react-navigation/native';

const FlyoutMenu = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const isAdmin = useSelector(selectIsAdmin);
  const navigation = useNavigation();
  const userData = useSelector(state => state.user.userData);

  if (!visible) return null;

  const handleLogout = async () => {
    dispatch(logout());
    onClose();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      <View style={styles.menu}>
        <View style={styles.menuHeader}>
          <View style={styles.userAvatar}>
            <Icon name="person" size={28} color="#fff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.nome_usuario || "Usuário"}</Text>
            <Text style={styles.userRole}>{isAdmin ? "Administrador" : "Profissional"}</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Icon name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContent}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Icon name="person-outline" size={22} color="#1e3d59" />
            <Text style={styles.menuText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
        
            activeOpacity={0.7}
          >
            <Icon name="history" size={22} color="#1e3d59" />
            <Text style={styles.menuText}>Histórico de atendimentos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Icon name="menu-book" size={22} color="#1e3d59" />
            <Text style={styles.menuText}>Guia</Text>
          </TouchableOpacity>
          
          {isAdmin && (
            <TouchableOpacity 
              style={styles.menuItem}   
              onPress={() => {
                onClose();
                navigation.navigate('HealthUnitList');
              }}
              activeOpacity={0.7}
            >
              <Icon name="business" size={22} color="#1e3d59" />
              <Text style={styles.menuText}>Unidades</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon name="logout" size={22} color="#e74c3c" />
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    right: 16,
    top: Platform.OS === 'ios' ? 44 : 16,
    backgroundColor: 'white',
    width: 280,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3d59',
    padding: 16,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
    marginHorizontal: 12,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutText: {
    color: '#e74c3c',
  },
});

export default FlyoutMenu;