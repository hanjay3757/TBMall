import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

const dummyEmployees = [
  { id: '1', name: '김직원', position: '매니저', department: '영업팀', email: 'kim@tbmall.com', phone: '010-1234-5678', joinDate: '2023-01-15', salary: '45000000', address: '서울시 강남구' },
  { id: '2', name: '이사원', position: '사원', department: '마케팅팀' },
  { id: '3', name: '박대리', position: '대리', department: '개발팀' },
];

const EmployeeManagementScreen = () => {
  const [employees, setEmployees] = useState(dummyEmployees);

  const handleDeleteEmployee = (id) => {
    Alert.alert(
      '직원 삭제',
      '정말 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            setEmployees(employees.filter(emp => emp.id !== id));
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('직원상세', { employee: item })}
      style={styles.employeeItem}
    >
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeDetails}>
          {item.position} | {item.department}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => Alert.alert('수정', '수정 기능 구현 예정')}
        >
          <Text style={styles.buttonText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteEmployee(item.id)}
        >
          <Text style={styles.buttonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>직원 관리</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('직원상세')}
        >
          <Text style={styles.addButtonText}>직원 추가</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#5f0080',
    padding: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  employeeDetails: {
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default EmployeeManagementScreen; 