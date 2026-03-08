export interface Parameter {
  name: string;
  type: string;
  min: number;
  max: number;
  value: number;
}

export interface ParameterFileData {
  parameters: Parameter[];
}
