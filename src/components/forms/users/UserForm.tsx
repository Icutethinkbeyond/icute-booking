"use client";

import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid2,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

// components
import { FC, useEffect, useState } from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { initialUser, User } from "@/interfaces/User";
import { useUserContext } from "@/contexts/UserContext";
import { LoadingButton } from "@mui/lab";
import ConfirmDelete from "@/components/shared/used/ConfirmDelete";
import { ButtonType } from "@/interfaces/ShredType";
import axios from "axios";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { RoleName, UserStatus } from "@prisma/client";
import StatusEquipment from "@/components/shared/used/Status";
import { Email, Visibility, VisibilityOff } from "@mui/icons-material";
import { KeyRound, Mail, UserPen } from "lucide-react";

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string().required("กรุณากรอกชื่อ"),
  email: Yup.string().email("อีเมลไม่ถูกต้อง").required("กรุณากรอกอีเมล"),
  roleName: Yup.string().required("โปรดกำหนดสิทธิการเข้าใช้งานระบบ"),
  password: Yup.string()
    .required("กรุณากรอกรหัสผ่าน")
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  repassword: Yup.string()
    .oneOf([Yup.ref("password"), "รหัสผ่านไม่ตรงกัน"], "รหัสผ่านไม่ตรงกัน")
    .required("กรุณายืนยันรหัสผ่าน"),
});

const validationSchemaEdit = Yup.object({
  name: Yup.string().required("กรุณากรอกชื่อ"),
  email: Yup.string().email("อีเมลไม่ถูกต้อง").required("กรุณากรอกอีเมล"),
  roleName: Yup.string().required("โปรดกำหนดสิทธิการเข้าใช้งานระบบ"),
});

interface userFormProps {}

const UserForm: FC<userFormProps> = ({}) => {
  const { userForm, userEdit, setUserForm, setUserEdit, makeFakeData } =
    useUserContext();

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const localActive = useLocale();

  const { setNotify, notify } = useNotifyContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disabledForm, setDisabledForm] = useState<boolean>(false);
  const [disabledPassword, setDisabledPassword] = useState<boolean>(false);
  const [disabledRole, setDisabledRole] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRePassword, setShowRePassword] = useState<boolean>(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowRePassword = () =>
    setShowRePassword((reshow) => !reshow);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleFormSubmit = (value: User, { resetForm, validateForm }: any) => {
    // console.log(value);
    validateForm(); // บังคับ validate หลังจากรีเซ็ต
    setIsLoading(true);
    if (userEdit) {
      updateUser(value, resetForm);
    } else {
      createUser(value, resetForm);
    }
    // resetForm(); // รีเซ็ตค่าฟอร์ม
  };

  const createUser = (user: User, resetForm: any) => {
    axios
      .post("/api/user", user)
      .then(() => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        resetForm();
        router.push(`/${localActive}/protected/user-management`);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);

          setNotify({
            ...notify,
            open: true,
            message: error.response.data,
            color: "error",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
        setUserForm(initialUser);
      });
  };

  const updateUser = (user: User, resetForm: any) => {
    axios
      .patch("/api/user", user)
      .then(() => {
        setNotify({
          ...notify,
          open: true,
          message: "การดำเนินการสำเร็จ",
          color: "success",
        });
        resetForm();
        router.push(`/${localActive}/protected/user-management`);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
          setNotify({
            ...notify,
            open: true,
            message: "พบปัญหาบางอย่างโปรดติดต่อผู้พัฒนา",
            color: "error",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
        setUserForm(initialUser);
        setUserEdit(false);
      });
  };

  const getDataUser = () => {
    const userId = params.get("userId");
    axios
      .get(`/api/user?userId=${userId}`)
      .then(({ data }) => {
        const modifiedData: User = {
          ...data,
          roleName: data.role.name,
          password: null,
        };

        setUserForm(modifiedData);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
        } else {
          console.error("Fetch error:", error);
        }
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (userForm.userStatus === UserStatus.InActice) {
      setDisabledForm(true);
      setDisabledRole(true);
    }
    // if (userForm.role?.name === RoleName.Employee) {
    //   setDisabledPassword(true);
    // }
  }, [userForm]);

  useEffect(() => {
    if (pathname.includes("new")) {
      setUserForm(initialUser);
      setUserEdit(false);
      setDisabledForm(false);
      setDisabledPassword(true);
    } else {
      setDisabledRole(true);
      setUserEdit(true);
      getDataUser();
    }
    return () => {
      setUserForm(initialUser);
      setUserEdit(false);
      setDisabledForm(false);
      setDisabledPassword(false);
    };
  }, []);

  return (
    <>
      <Formik<User>
        initialValues={userForm}
        validationSchema={
          userEdit || userForm.roleName === RoleName.Employee
            ? validationSchemaEdit
            : validationSchema
        }
        onSubmit={handleFormSubmit}
        enableReinitialize // เพื่อให้ Formik อัปเดตค่าจาก useState
      >
        {({
          isSubmitting,
          resetForm,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <Form>
            <Grid2 container spacing={3} sx={{ p: 3 }}>
              <Grid2 size={12}>
                <Grid2 size={{ xs: 12 }} mb={2}>
                  <Grid2 container alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <KeyRound size={20} />
                    </Avatar>
                    <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                      สำหรับการเข้าใช้งานระบบ
                    </Typography>
                  </Grid2>
                </Grid2>
                {userForm.userStatus === UserStatus.InActice && (
                  <StatusEquipment
                    status={userForm.userStatus}
                    message="ยกเลิกใช้งานบัญชี ไม่สามารถแก้ไขได้"
                  />
                )}
                {/* Username Field */}
                <Grid2 container spacing={2} mt={5}>
                  <Grid2 container size={6}>
                    <Grid2 size={12}>
                      <FormControl
                        disabled={disabledRole}
                        fullWidth
                        error={touched.roleName && Boolean(errors.roleName)}
                      >
                        <InputLabel id="roleId-label">
                          สิทธิการเข้าใช้งาน
                        </InputLabel>
                        <Field name="roleName">
                          {({ field }: any) => (
                            <Select
                              {...field}
                              label="สิทธิการเข้าใช้งาน"
                              name="roleName"
                              labelId="roleName-label"
                              value={values.roleName}
                              disabled={disabledRole}
                              onChange={(event) => {
                                const value = event.target.value as RoleName;
                                setFieldValue("roleName", value);
                              }}
                            >
                              {Object.values(RoleName).map((role) => (
                                <MenuItem key={role} value={role}>
                                  {role}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </Field>
                        {touched.roleId && errors.roleId && (
                          <FormHelperText> {errors.roleId} </FormHelperText>
                        )}
                      </FormControl>
                      <Typography mt={1} variant="body2">
                        *หากต้องการเพิ่มพนักงานไม่ต้องใส่รหัสผ่าน
                      </Typography>
                    </Grid2>
                  </Grid2>

                  <Grid2 container size={6} justifyContent={"flex-end"}>
                    <Grid2 size={12}>
                      <Field name="email">
                        {({ field }: any) => (
                          <TextField
                            {...field}
                            name="email"
                            label="อีเมลผู้ใช้งาน (จำเป็น)"
                            value={values.email ? values.email : ""}
                            slotProps={{
                              inputLabel: { shrink: true },
                            }}
                            onChange={(e) => {
                              setFieldValue("email", e.target.value);
                            }}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            fullWidth
                          />
                        )}
                      </Field>
                    </Grid2>

                    {disabledPassword ? (
                      <>
                        <Grid2 size={{ xs: 12 }}>
                          <Field name="password">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                type={showPassword ? "text" : "password"}
                                disabled={
                                  values.roleName === RoleName.Employee ||
                                  values.roleName === "" ||
                                  disabledForm
                                }
                                slotProps={{
                                  inputLabel: { shrink: true },
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          aria-label={
                                            showPassword
                                              ? "ซ่อนรหัสผ่าน"
                                              : "แสดงรหัสผ่าน"
                                          }
                                          disabled={
                                            values.roleName ===
                                              RoleName.Employee ||
                                            values.roleName === "" ||
                                            disabledForm
                                          }
                                          onClick={handleClickShowPassword}
                                          onMouseDown={handleMouseDownPassword}
                                          onMouseUp={handleMouseUpPassword}
                                          edge="end"
                                        >
                                          {showPassword ? (
                                            <VisibilityOff />
                                          ) : (
                                            <Visibility />
                                          )}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                                name="password"
                                label="รหัสผ่าน"
                                value={values.password ? values.password : ""}
                                onChange={(e) => {
                                  setFieldValue("password", e.target.value);
                                }}
                                error={
                                  touched.password && Boolean(errors.password)
                                }
                                helperText={touched.password && errors.password}
                                fullWidth
                              />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                          <Field name="repassword">
                            {({ field }: any) => (
                              <TextField
                                {...field}
                                type={showRePassword ? "text" : "password"}
                                disabled={
                                  values.roleName === RoleName.Employee ||
                                  values.roleName === "" ||
                                  disabledForm
                                }
                                slotProps={{
                                  inputLabel: { shrink: true },
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          aria-label={
                                            showRePassword
                                              ? "ซ่อนรหัสผ่าน"
                                              : "แสดงรหัสผ่าน"
                                          }
                                          disabled={
                                            values.roleName ===
                                              RoleName.Employee ||
                                            values.roleName === "" ||
                                            disabledForm
                                          }
                                          onClick={handleClickShowRePassword}
                                          onMouseDown={handleMouseDownPassword}
                                          onMouseUp={handleMouseUpPassword}
                                          edge="end"
                                        >
                                          {showRePassword ? (
                                            <VisibilityOff />
                                          ) : (
                                            <Visibility />
                                          )}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                                name="repassword"
                                label="ยืนยันรหัสผ่าน"
                                value={
                                  values.repassword ? values.repassword : ""
                                }
                                onChange={(e) => {
                                  setFieldValue("repassword", e.target.value);
                                }}
                                error={
                                  touched.repassword &&
                                  Boolean(errors.repassword)
                                }
                                helperText={
                                  touched.repassword && errors.repassword
                                }
                                fullWidth
                              />
                            )}
                          </Field>
                        </Grid2>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          onClick={() =>
                            setDisabledPassword(
                              (disabledPassword) => !disabledPassword
                            )
                          }
                          sx={{ mr: 1 }}
                        >
                          {disabledPassword ? "ยกเลิก" : "แก้ไขรหัสผ่าน"}
                        </Button>
                      </>
                    )}
                  </Grid2>
                </Grid2>
              </Grid2>
              <Grid2 size={12} mt={2}>
                <Box>
                  <Grid2 size={{ xs: 12 }} mb={2}>
                    <Grid2 container alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <UserPen size={20} />
                      </Avatar>
                      <Typography variant="h4" gutterBottom ml={2} mt={0.5}>
                        รายละเอียดส่วนตัว
                      </Typography>
                    </Grid2>
                  </Grid2>
                </Box>
                <Grid2 container spacing={2} mt={5}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="name">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          name="name"
                          label="ชื่อ (จำเป็น)"
                          value={values.name}
                          onChange={(e) => {
                            setFieldValue("name", e.target.value);
                          }}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          disabled={disabledForm}
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          fullWidth
                        />
                      )}
                    </Field>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="phone">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          name="phone"
                          label="โทรศัพท์ (ถ้ามี)"
                          value={values.phone ? values.phone : ""}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          disabled={disabledForm}
                          onChange={(e) => {
                            setFieldValue("phone", e.target.value);
                          }}
                          fullWidth
                        />
                      )}
                    </Field>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="department">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          name="department"
                          label="แผนก (ถ้ามี)"
                          value={values.department ? values.department : ""}
                          onChange={(e) => {
                            setFieldValue("department", e.target.value);
                          }}
                          disabled={disabledForm}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          fullWidth
                        />
                      )}
                    </Field>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="position">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          name="position"
                          label="ตำแหน่ง (ถ้ามี)"
                          value={values.position ? values.position : ""}
                          onChange={(e) => {
                            setFieldValue("position", e.target.value);
                          }}
                          disabled={disabledForm}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          fullWidth
                        />
                      )}
                    </Field>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="manDay">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          name="manDay"
                          type="number"
                          label="ค่าจ้าง/ชั่วโมง (ถ้ามี)"
                          value={values.manDay ? values.manDay : ""}
                          onChange={(e) => {
                            setFieldValue("manDay", e.target.value);
                          }}
                          disabled={disabledForm}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          fullWidth
                        />
                      )}
                    </Field>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="address">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          name="address"
                          label="ที่อยู่ (ถ้ามี)"
                          value={values.address ? values.address : ""}
                          multiline
                          rows={4}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          disabled={disabledForm}
                          onChange={(e) => {
                            setFieldValue("address", e.target.value);
                          }}
                          fullWidth
                        />
                      )}
                    </Field>
                  </Grid2>
                </Grid2>
              </Grid2>
              <Grid2
                spacing={1}
                container
                size={12}
                justifyContent="flex-end"
                alignItems="flex-end"
              >
                {userEdit === false ? (
                  <Button
                    variant="outlined"
                    onClick={makeFakeData}
                    sx={{ mr: 1 }}
                  >
                    สร้างแบบรวดเร็ว
                  </Button>
                ) : (
                  ""
                )}
                <LoadingButton
                  variant="contained"
                  type="submit"
                  color="primary"
                  sx={{ mr: 1 }}
                  disabled={disabledForm}
                  loading={isLoading}
                >
                  {!userEdit ? "เพิ่มผู้ใช้งานใหม่" : "แก้ไขผู้ใช้งาน"}
                </LoadingButton>
                <ConfirmDelete
                  itemId={""}
                  onDisable={disabledForm}
                  onDelete={() => resetForm()}
                  massage={`คุณต้องการล้างฟอร์มใช่หรือไม่?`}
                  buttonType={ButtonType.Button}
                />
              </Grid2>
            </Grid2>
          </Form>
        )}
      </Formik>
      {/* Add other TabPanels for Notifications, Bills, and Security if needed */}
    </>
  );
};

export default UserForm;
