// src/components/common/UserSelect.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import apiClient from "@/api/client";

const UserSelect = ({
  value,
  onChange,
  roleFilter = null,
  label = "Пользователь",
  placeholder = "Выберите пользователя",
  disabled = false,
  size = "small",
  fullWidth = true,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isSelecting = useRef(false);
  const roleFilterRef = useRef(roleFilter);
  const initialLoadDone = useRef(false);

  const fetchUsers = useCallback(
    async (searchTerm = "") => {
      if (isSelecting.current) return;
      setLoading(true);
      try {
        const params = {};
        if (roleFilter) {
          params.roleId = Array.isArray(roleFilter)
            ? roleFilter.join(",")
            : roleFilter;
        }
        if (searchTerm) {
          params.search = searchTerm;
        }
        const response = await apiClient.get("/users", { params });
        const usersData = response.data?.data || response.data || [];
        setUsers(usersData);
      } catch (error) {
        
        console.warn("API /users недоступен, используются мок-данные:", error);
        let filtered = [];
        if (roleFilter) {
          const roles = Array.isArray(roleFilter) ? roleFilter : [roleFilter];
          filtered = filtered.filter((u) => roles.includes(u.roleid));
        }
        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.name.toLowerCase().includes(lower) ||
              u.surname.toLowerCase().includes(lower) ||
              `${u.surname} ${u.name}`.toLowerCase().includes(lower),
          );
        }
        setUsers(filtered);
      } finally {
        setLoading(false);
      }
    },
    [roleFilter],
  );

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchUsers("");
    }
  }, [fetchUsers]);

  useEffect(() => {
    if (roleFilterRef.current !== roleFilter) {
      roleFilterRef.current = roleFilter;
      onChange?.(null);
      setInputValue("");
      fetchUsers("");
    }
  }, [roleFilter, fetchUsers, onChange]);

  useEffect(() => {
    if (!isSelecting.current && inputValue.trim() !== "") {
      const timer = setTimeout(() => fetchUsers(inputValue), 400);
      return () => clearTimeout(timer);
    }
  }, [inputValue, fetchUsers]);

  const options = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        label: `${u.surname} ${u.name} ${u.patronymic || ""}`.trim(),
        role: u.rolename,
      })),
    [users],
  );

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id == value) || null,
    [options, value],
  );

  const handleChange = (event, newValue) => {
    isSelecting.current = true;
    onChange?.(newValue ? newValue.id : null);
    setTimeout(() => {
      isSelecting.current = false;
    }, 150);
  };

  const handleInputChange = (event, newInputValue, reason) => {
    setInputValue(newInputValue);

    if (reason === "reset" || reason === "blur") {
      isSelecting.current = true;
      setTimeout(() => {
        isSelecting.current = false;
      }, 200);
    }
  };

  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div>
            <strong>{option.label}</strong>
            <br />
            <small style={{ color: "gray" }}>{option.role}</small>
          </div>
        </li>
      )}
    />
  );
};

export default UserSelect;
