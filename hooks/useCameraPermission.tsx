import { useEffect, useState, useRef } from "react";

export type TPermissionState = "granted" | "denied" | "prompt" | "unknown";

const useCameraPermission = (): PermissionState => {
  const [cameraPermission, setCameraPermission] =
    useState<PermissionState>("prompt");
  const permissionRef = useRef<PermissionStatus | null>(null);

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        permissionRef.current = permissionStatus;

        const updatePermission = () => {
          setCameraPermission(permissionStatus.state as PermissionState);
        };

        permissionStatus.onchange = updatePermission;
        updatePermission();
      } catch (error) {
        console.error("Error checking camera permission:", error);
      }
    };

    checkCameraPermission();

    return () => {
      // Clean up event listener when unmounting component
      if (permissionRef.current) {
        permissionRef.current.onchange = null;
      }
    };
  }, []);

  return cameraPermission;
};

export default useCameraPermission;
