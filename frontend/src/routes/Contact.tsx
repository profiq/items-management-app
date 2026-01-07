import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function Contact() {
  return (
    <>
      <h1 className='p-3'>Contact page</h1>
      <div className='w-full border-solid border-2 p-3'>
        <form>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Contact</FieldLegend>
              <FieldDescription>Form for contact us</FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='contact-name'>Name</FieldLabel>
                  <Input id='contact-name' required />
                </Field>
                <Field>
                  <FieldLabel htmlFor='contact-email'>Email</FieldLabel>
                  <Input id='contact-email' required />
                </Field>
                <Field>
                  <FieldLabel htmlFor='contact-text'>Text</FieldLabel>
                  <Textarea
                    id='contact-text'
                    className='resize-none'
                    placeholder='Your text'
                    required
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <Field orientation='responsive'>
              <Button type='submit' variant='outline'>
                Submit
              </Button>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </>
  );
}

export default Contact;
