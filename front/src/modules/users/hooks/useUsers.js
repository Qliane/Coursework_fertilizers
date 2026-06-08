/* eslint-disable no-unused-vars */
// src/modules/users/hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/api/endpoints/users';
import { storageService } from '@/api/endpoints/storage';
import { partnerService } from '@/api/endpoints/partner';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [storageFilter, setStorageFilter] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');

  const [storages, setStorages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [userStorageMap, setUserStorageMap] = useState({});
  const [userPartnerMap, setUserPartnerMap] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.roleId = roleFilter;
      const usersData = await userService.getAll(params);

      const [storagesData, partnersData] = await Promise.all([
        storageService.getAll(),
        partnerService.getAll(),
      ]);
      setStorages(storagesData);
      setPartners(partnersData);

      const employeesPromises = storagesData.map(s => storageService.getEmployees(s.id).catch(() => []));
      const employeesResults = await Promise.all(employeesPromises);
      const employees = employeesResults.flat();
      const storageByUser = {};
      employees.forEach(emp => {
        storageByUser[emp.userid] = emp.storageid;
      });

      const driversByPartner = await partnerService.getAll(); 
      const partnersDataAll = partnersData;
      const partnerByUser = {};
      partnersDataAll.forEach(partner => {
        if (partner.userid) {
          partnerByUser[partner.userid] = partner.id;
        }
      });

      setUserStorageMap(storageByUser);
      setUserPartnerMap(partnerByUser);

      const enrichedUsers = usersData.map(user => ({
        ...user,
        storageId: storageByUser[user.id] || null,
        partnerId: partnerByUser[user.id] || null,
      }));
      setUsers(enrichedUsers);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  const filteredUsers = users.filter(user => {
    if (storageFilter && user.storageId !== storageFilter) return false;
    if (partnerFilter && user.partnerId !== partnerFilter) return false;
    return true;
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (data) => {
    try {
      const newUser = await userService.create(data);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка создания');
    }
  };

  const updateUser = async (id, data) => {
    try {
      const updated = await userService.update(id, data);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления');
    }
  };

  const deleteUser = async (id) => {
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  return {
    users: filteredUsers,
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    storageFilter,
    setStorageFilter,
    partnerFilter,
    setPartnerFilter,
    storages,
    partners,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};