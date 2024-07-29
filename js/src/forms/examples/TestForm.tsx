import StringField from '../components/fields/StringField.tsx';
import Button from '../components/Button.tsx';

import TextInput, { TextInputProps } from '../components/widgets/TextInput.tsx';
import Widget from '../components/widgets/Widget.tsx';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import BooleanField from '../components/fields/BooleanField.tsx';
import Form from '../components/forms/Form.tsx';
import { useForm, useFormState } from 'react-hook-form';
import DateField from '../components/fields/DateField.tsx';
import SelectField from '../components/fields/SelectField.tsx';
import IntegerField from '../components/fields/IntegerField.tsx';
import MultiSelectField from '../components/fields/MultiSelectField.tsx';
import Switch from '../components/widgets/Switch.tsx';
import MemorableDateInput from '../components/widgets/MemorableDateInput.tsx';
import CheckboxGroup from '../components/widgets/CheckboxGroup.tsx';
import ToggleButton from '../components/widgets/ToggleButton.tsx';
import TextField from '../components/fields/TextField.tsx';
import RadioGroup from '../components/widgets/RadioGroup.tsx';
import FileField from '../components/fields/FileField.tsx';
import * as React from 'react';

export type TestFormFieldValues = {
    name: string;
    password: string;
    date: string;
    terms: boolean;
};

const PasswordInput = (props: TextInputProps) => {
    const [visible, setVisible] = useState(false);
    return (
        <TextInput
            type={visible ? 'text' : 'password'}
            controls={
                <Widget.ControlButton onClick={() => setVisible(!visible)} key="togglePasswordVisible">
                    {visible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </Widget.ControlButton>
            }
            placeholder="••••••••••••••"
            {...props}
        />
    );
};

const MaxLengthTextInput = (props: TextInputProps) => {
    return <TextInput {...props} maxLength={10} />;
};

const TestForm = (props: any) => {
    const formMethods = useForm({
        defaultValues: {
            file: [
                {
                    name: 'about.png',
                    url: 'https://nico.is/site/templates/dist/images/about.png',
                },
            ],
            name: 'test',
            password: '',
            date: '',
            birthday: '',
            terms: undefined,
            terms2: undefined,
            language: '',
            language2: '',
            language3: '',
            animals: [],
            animals2: [],
            notes: '',
        },
    });

    const LANGUAGE_OPTIONS = [
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Deutsch' },
        { value: 'fr', label: 'Français' },
        { value: 'es', label: 'Español' },
        { value: 'it', label: 'Italiano' },
    ];

    const ANIMAL_OPTIONS = [
        { value: 'cat', label: 'Cat' },
        { value: 'dog', label: 'Dog' },
        { value: 'bird', label: 'Bird' },
        { value: 'fish', label: 'Fish' },
        { value: 'rabbit', label: 'Rabbit' },
    ];

    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState(false);
    const [placeholder, setPlaceholder] = useState(false);

    const sharedProps = {
        disabled,
        error: error ? 'This field is required' : undefined,
        placeholder: placeholder ? 'Placeholder' : undefined,
    };

    return (
        <div className="w-full flex justify-center">
            <div className="flex flex-col gap-16 max-w-[800px] w-full">
                <div className="flex flex-col gap-4">
                    <label>
                        <input type="checkbox" onChange={(e) => setDisabled(e.target.checked)} />
                        <span>Disabled</span>
                    </label>

                    <label>
                        <input type="checkbox" onChange={(e) => setError(e.target.checked)} />
                        <span>Error</span>
                    </label>

                    <label>
                        <input type="checkbox" onChange={(e) => setPlaceholder(e.target.checked)} />
                        <span>Placeholder</span>
                    </label>
                </div>

                <Form
                    formMethods={formMethods}
                    className="flex flex-col gap-6 max-w-[800px] w-full"
                    onSubmit={(values) => {
                        console.log(values);

                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(values);
                            }, 2000);
                        });
                    }}
                >
                    <h2 className="text-2xl">Controlled</h2>
                    <Form.Field name="file">
                        <FileField
                            label="File"
                            {...sharedProps}
                            multiple
                            placeholder={
                                <>
                                    Drag 'n' drop some files or{' '}
                                    <u className="underline cursor-pointer group-hover:text-theme-500 transition-colors">
                                        choose files
                                    </u>
                                </>
                            }
                        />
                    </Form.Field>

                    <Form.Field name="name">
                        <StringField label="Name" required widget={MaxLengthTextInput} {...sharedProps} />
                    </Form.Field>

                    <Form.Field name="password">
                        <StringField label="Password" required widget={PasswordInput} {...sharedProps} />
                    </Form.Field>

                    <Form.Field name="date">
                        <DateField label="Date" required {...sharedProps} />
                    </Form.Field>

                    <Form.Field name="birthday">
                        <DateField label="Birthday" widget={MemorableDateInput} {...sharedProps} />
                    </Form.Field>

                    <Form.Field name="age">
                        <IntegerField label="Age" required {...sharedProps} />
                    </Form.Field>

                    <Form.Field name="language">
                        <SelectField
                            label="Language"
                            options={LANGUAGE_OPTIONS}
                            // placeholder="Select a language..."
                            // widget={ToggleButton}
                            searchPlaceholder="Search..."
                            emptyLabel="No language"
                            // required
                            {...sharedProps}
                        />
                    </Form.Field>

                    <Form.Field name="language2">
                        <SelectField
                            label="Language2"
                            options={LANGUAGE_OPTIONS}
                            // placeholder="Select a language..."
                            widget={ToggleButton}
                            {...sharedProps}
                        />
                    </Form.Field>

                    <Form.Field name="language3">
                        <SelectField
                            label="Language3"
                            options={LANGUAGE_OPTIONS}
                            // placeholder="Select a language..."
                            widget={RadioGroup}
                            {...sharedProps}
                        />
                    </Form.Field>

                    <Form.Field name="animals">
                        <MultiSelectField
                            label="Animals"
                            options={ANIMAL_OPTIONS}
                            // placeholder="Select an animal..."
                            {...sharedProps}
                        />
                    </Form.Field>

                    <Form.Field name="animals2">
                        <MultiSelectField
                            required
                            label="Animals 2"
                            options={ANIMAL_OPTIONS}
                            // placeholder="Select an animal..."
                            widget={CheckboxGroup}
                            {...sharedProps}
                        />
                    </Form.Field>

                    <Form.Field name="terms">
                        <BooleanField
                            label="I agree to the terms and conditions"
                            required
                            helpText="Please read the terms and conditions before agreeing."
                            widget={Switch}
                            reverse
                            {...sharedProps}
                        />
                    </Form.Field>

                    <Form.Field name="terms2">
                        <BooleanField
                            label="I agree to the terms and conditions"
                            helpText="Please read the terms and conditions before agreeing."
                            {...sharedProps}
                        />
                    </Form.Field>

                    <Form.Field name="notes">
                        <TextField {...sharedProps} />
                    </Form.Field>

                    <Button type="submit" loading={formMethods.formState.isSubmitting}>
                        Submit
                    </Button>
                </Form>

                <div className="flex flex-col gap-6">
                    <h2 className="text-2xl">Uncontrolled</h2>

                    <StringField label="Name" required widget={MaxLengthTextInput} {...sharedProps} />

                    <StringField label="Password" required widget={PasswordInput} {...sharedProps} />

                    <DateField label="Date" id="uncontrolled-date" required {...sharedProps} />

                    <DateField label="Birthday" widget={MemorableDateInput} {...sharedProps} />

                    <IntegerField label="Age" required {...sharedProps} />

                    <SelectField
                        label="Language"
                        options={LANGUAGE_OPTIONS}
                        // placeholder="Select a language..."
                        required
                        {...sharedProps}
                    />

                    <SelectField
                        label="Language2"
                        options={LANGUAGE_OPTIONS}
                        // placeholder="Select a language..."
                        widget={ToggleButton}
                        {...sharedProps}
                    />

                    <SelectField
                        label="Language3"
                        options={LANGUAGE_OPTIONS}
                        // placeholder="Select a language..."
                        widget={RadioGroup}
                        {...sharedProps}
                    />

                    <MultiSelectField
                        label="Animals"
                        options={ANIMAL_OPTIONS}
                        // placeholder="Select an animal..."
                        {...sharedProps}
                    />

                    <MultiSelectField
                        label="Animals 2"
                        options={ANIMAL_OPTIONS}
                        // placeholder="Select an animal..."
                        widget={CheckboxGroup}
                        {...sharedProps}
                    />

                    <BooleanField
                        label="I agree to the terms and conditions"
                        required
                        helpText="Please read the terms and conditions before agreeing."
                        widget={Switch}
                        reverse
                        {...sharedProps}
                    />

                    <BooleanField
                        label="I agree to the terms and conditions"
                        helpText="Please read the terms and conditions before agreeing."
                        {...sharedProps}
                    />

                    <TextField id="notes" {...sharedProps} />

                    <Button type="submit">Submit</Button>
                </div>
            </div>
        </div>
    );
};

export default TestForm;
