export interface AddAndEditTask {
  visible: boolean;
  taskInfo?: Task | null;
  onClose: () => void;
  refresh: () => void;
}

export interface ViewRecord {
  visible: boolean;
  id: string;
  status?: string;
  onCancel: () => void;
}

export interface ProxyPoolProps {
  visible: boolean;
  onClose: () => void;
}
