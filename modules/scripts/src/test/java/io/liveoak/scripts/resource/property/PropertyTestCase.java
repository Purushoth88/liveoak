package io.liveoak.scripts.resource.property;

import com.fasterxml.jackson.databind.JsonNode;
import io.liveoak.scripts.JavaScriptResourceState;
import io.liveoak.scripts.resource.BaseResourceTriggeredTestCase;
import io.liveoak.spi.RequestContext;
import io.liveoak.spi.state.ResourceState;
import org.junit.Before;
import org.junit.Test;

import static org.fest.assertions.Assertions.assertThat;

/**
 * @author <a href="mailto:mwringe@redhat.com">Matt Wringe</a>
 */
public class PropertyTestCase extends BasePropertyTestCase {
    // TODO: test here a bunch of things such as enable/disable
    // priority
    // etc

    // NOTE: not meant to check things like CRUD on the properties but to test the properties behaviour.
    // Please see the io.liveoak.scripts.resource for CRUD testing

    @Before
    public void setupTests() throws Exception {
        //check that there are no other scripts configured
        ResourceState initialState = client.read(new RequestContext.Builder().build(), RESOURCE_SCRIPT_PATH);
        assertThat(initialState.members()).isEmpty();

        //create the metadata for the script
        ResourceState resourceState = client.create(new RequestContext.Builder().build(), RESOURCE_SCRIPT_PATH, new BaseResourceTriggeredTestCase.MetadataState("propertyTest", "/testApp/*").libraries("client").build());
        assertThat(resourceState).isNotNull();
        assertThat(resourceState.id()).isEqualTo("propertyTest");

        //upload the javascript file
        ResourceState binaryResourceState = new JavaScriptResourceState(readFile("testMetadata.js"));
        ResourceState javascriptState = client.create(new RequestContext.Builder().build(), resourceState.uri().toString(), binaryResourceState);
        assertThat(javascriptState).isNotNull();
    }

    @Test (timeout = 18000)
    public void timeoutTests() throws Exception {
        // Test #1 - Default timeout
        Long startTime = System.currentTimeMillis();
        // Trigger a read
        JsonNode result = getJSON("/testApp/mock?test=testTimeout");
        Long endTime = System.currentTimeMillis();

        assertThat(result.get("error-type").textValue()).isEqualTo("INTERNAL_ERROR");
        assertThat(result.get("message").textValue()).isEqualTo("A timeout occurred when running the script.");

        Long executionTime = endTime - startTime;
        assertThat(executionTime).isGreaterThan(5000); //5000 is the timeout value


        // Tests #2 - Timeout with force
        startTime = System.currentTimeMillis();
        // Trigger a read
        result = getJSON("/testApp/mock?test=testTimeoutWithForce");
        endTime = System.currentTimeMillis();

        assertThat(result.get("error-type").textValue()).isEqualTo("INTERNAL_ERROR");
        assertThat(result.get("message").textValue()).isEqualTo("A timeout occurred when running the script.");

        executionTime = endTime - startTime;
        assertThat(executionTime).isGreaterThan(10000); //5000 is the timeout value for the script + 5000 to wait until we kill the thread


        // Test #3 - Custom timeout
        int timeout = 500;
        client.update(new RequestContext.Builder().build(), RESOURCE_SCRIPT_PATH + "/propertyTest",
                new BaseResourceTriggeredTestCase.MetadataState("propertyTest", "/testApp/*")
                        .libraries("client").timeout(timeout).build());

        startTime = System.currentTimeMillis();
        // Trigger a read
        result = getJSON("/testApp/mock?test=testTimeout");
        endTime = System.currentTimeMillis();

        assertThat(result.get("error-type").textValue()).isEqualTo("INTERNAL_ERROR");
        assertThat(result.get("message").textValue()).isEqualTo("A timeout occurred when running the script.");

        executionTime = endTime - startTime;
        assertThat(executionTime).isGreaterThan(timeout);
    }
}
