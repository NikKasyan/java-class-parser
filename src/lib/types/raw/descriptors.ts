const BaseTypes = {
  B: "byte",
  C: "char",
  D: "double",
  F: "float",
  I: "int",
  J: "long",
  S: "short",
  Z: "boolean",
};
type BaseType = (typeof BaseTypes)[keyof typeof BaseTypes];

type ArrayType = {
  type: FieldType;
  dimensions: number;
};

type ObjectType = {
  type: string;
};

type FieldType = ArrayType | ObjectType | BaseType;

const isBaseType = (type: FieldType): type is BaseType => {
  return typeof type === "string";
};

const isArrayType = (type: FieldType): type is ArrayType => {
  if (isBaseType(type)) return false;
  return "dimensions" in type;
};

const isObjectType = (type: FieldType): type is ObjectType => {
  if (isBaseType(type)) return false;
  if (isArrayType(type)) return false;
  return "type" in type;
};

export const extractFieldType = (fieldDescriptor: string): FieldType => {
  if (fieldDescriptor in BaseTypes) {
    return BaseTypes[fieldDescriptor as keyof typeof BaseTypes];
  }
  if (fieldDescriptor.startsWith("L")) {
    if (fieldDescriptor.endsWith(";")) {
      if (fieldDescriptor.length === 2)
        throw new Error("Invalid object type, expected class name");
      return { type: fieldDescriptor.slice(1, fieldDescriptor.length - 1) };
    }
    throw new Error("Invalid object type, expected ; at the end");
  } else if (fieldDescriptor.startsWith("[")) {
    let dimensions = 0;
    while (fieldDescriptor[dimensions] === "[") {
      dimensions++;
    }
    if (dimensions === fieldDescriptor.length)
      throw new Error("Invalid array type, expected type after [");
    if (dimensions > 255)
      throw new Error(
        "Invalid array type, may not have more than 255 dimensions"
      );
    return {
      type: extractFieldType(fieldDescriptor.slice(dimensions)),
      dimensions,
    };
  }
  throw new Error("Invalid type format" + fieldDescriptor);
};

export const VoidTypes = {
  V: "void",
};

type VoidType = (typeof VoidTypes)[keyof typeof VoidTypes];

type MethodDescriptor = {
  returnType: FieldType | VoidType;
  parameters: FieldType[];
};

export const extractMethodDescriptor = (
  methodDescriptor: string
): MethodDescriptor => {
  const openParenthesis = methodDescriptor.indexOf("(");
  if (openParenthesis === -1)
    throw new Error("Invalid method descriptor, expected (");
  const closeParenthesis = methodDescriptor.indexOf(")");
  if (closeParenthesis === -1)
    throw new Error("Invalid method descriptor, expected )");
  const returnType = extractReturnType(
    methodDescriptor.slice(closeParenthesis + 1)
  );

  const parametersString = methodDescriptor.slice(
    openParenthesis + 1,
    closeParenthesis
  );
  const parameters = extractParameters(parametersString);
  return { returnType, parameters };
};

const extractReturnType = (returnTypeString: string): FieldType | VoidType => {
  if (returnTypeString in VoidTypes)
    return VoidTypes[returnTypeString as keyof typeof VoidTypes];
  return extractFieldType(returnTypeString);
};
const extractParameters = (parametersString: string): FieldType[] => {
  const parameters: FieldType[] = [];
  while (parametersString.length > 0) {
    const type = extractFieldType(parametersString);
    parameters.push(type);
    let length = 1;
    if (isBaseType(type)) length = type.length;
    else if (isObjectType(type))
      length = type.type.length + 2; // +2 for L and ;
    else if (isArrayType(type)) {
      length = type.dimensions;
      if (isBaseType(type.type)) length += type.type.length;
      else if (isObjectType(type.type)) length += type.type.type.length + 2; // +2 for L and ;
    }
    parametersString = parametersString.slice(length);
    if (parameters.length > 255)
      throw new Error(
        "Invalid method descriptor, may not have more than 255 parameters"
      );
  }
  return parameters;
};
