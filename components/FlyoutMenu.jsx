import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Animated, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logoutAsync } from '../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAdmin } from '../store/userSlice';
import { useNavigation, CommonActions } from '@react-navigation/native';

const FlyoutMenu = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const isAdmin = useSelector(selectIsAdmin);
  const navigation = useNavigation();
  const userData = useSelector(state => state.user.userData);
  
  // Animation for menu appearance
  const slideAnim = React.useRef(new Animated.Value(visible ? 0 : -300)).current;
  const opacityAnim = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              onClose();
              
              // Dispatch the async logout action
              await dispatch(logoutAsync());
              
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'InitialScreen' }],
                })
              );
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: opacityAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose} 
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.menu,
          { 
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
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
      </Animated.View>
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
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
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