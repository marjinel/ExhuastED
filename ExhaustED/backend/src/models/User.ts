import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  studentId: string;
  program: string;
  yearLevel: number;
  gradeLevel?: string;
  age?: number | null;
  school?: string;
  profileImageUri?: string;
  password: string;
  notificationPreferences: {
    enabled: boolean;
    dailyCheckin: boolean;
    studyBreaks: boolean;
    hydration: boolean;
    sleep: boolean;
  };
  privacyPreferences: {
    anonymousCommunity: boolean;
    saveChatHistory: boolean;
    localOnlyMode: boolean;
  };
  wellnessPreferences: {
    remindersEnabled: boolean;
    reminderTime: string;
    language: 'English';
  };
  expoPushToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    program: {
      type: String,
      required: [true, 'Program/Course is required'],
      trim: true,
    },
    yearLevel: {
      type: Number,
      required: [true, 'Year level is required'],
      min: [1, 'Year level must be at least 1'],
      max: [6, 'Year level cannot exceed 6'],
    },
    gradeLevel: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Grade level cannot exceed 80 characters'],
    },
    age: {
      type: Number,
      default: null,
      min: [1, 'Age must be valid'],
      max: [120, 'Age must be valid'],
    },
    school: {
      type: String,
      trim: true,
      default: '',
      maxlength: [160, 'School cannot exceed 160 characters'],
    },
    profileImageUri: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Profile image URI cannot exceed 1000 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    notificationPreferences: {
      enabled: { type: Boolean, default: true },
      dailyCheckin: { type: Boolean, default: true },
      studyBreaks: { type: Boolean, default: true },
      hydration: { type: Boolean, default: false },
      sleep: { type: Boolean, default: true },
    },
    privacyPreferences: {
      anonymousCommunity: { type: Boolean, default: true },
      saveChatHistory: { type: Boolean, default: true },
      localOnlyMode: { type: Boolean, default: false },
    },
    wellnessPreferences: {
      remindersEnabled: { type: Boolean, default: true },
      reminderTime: { type: String, default: '20:00', maxlength: 10 },
      language: { type: String, enum: ['English'], default: 'English' },
    },
    expoPushToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as Partial<IUser>).password;
        return ret;
      },
    },
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
